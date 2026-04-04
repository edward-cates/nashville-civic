import { geocodeAddress } from '$lib/server/geocode';
import { getRepresentatives } from '$lib/server/civic';
import { getStateLegislators } from '$lib/server/openstates';
import { findDistrict } from '$lib/server/districts';
import { getPersonByName, getPersonSponsored, getPersonCommittees } from '$lib/server/legistar';
import { summarizeLegislation, summarizeRepActivity } from '$lib/server/narrative';
import type { Representative } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const address = url.searchParams.get('address');
	if (!address) {
		return { address: null, district: null, localRep: null, localRepNarrative: '',
			localRepCommittees: [], localRepBills: [], stateReps: [], federalReps: [],
			mayor: null, error: null };
	}

	const geo = await geocodeAddress(address);
	if (!geo) {
		return { address, district: null, localRep: null, localRepNarrative: '',
			localRepCommittees: [], localRepBills: [], stateReps: [] as Representative[],
			federalReps: [] as Representative[], mayor: null,
			error: 'We couldn\'t find that address. Try a zip code (37203), street address, or neighborhood name.' };
	}

	const districtResult = findDistrict(geo.lat, geo.lng);

	const [civicReps, stateReps] = await Promise.all([
		getRepresentatives(address).catch(() => [] as Representative[]),
		getStateLegislators(geo.lat, geo.lng).catch(() => [] as Representative[])
	]);

	const localRep = districtResult?.representative || null;

	// Fetch council member detail data from Legistar
	let localRepCommittees: Array<{ name: string; title: string }> = [];
	let localRepBills: Array<{ fileNumber: string; title: string; summary: string; tension: string;
		status: string; controversyScore: number; sourceUrl: string }> = [];
	let localRepNarrative = '';

	if (localRep) {
		try {
			const person = await getPersonByName(localRep.name);
			if (person) {
				const [committees, sponsoredRaw] = await Promise.all([
					getPersonCommittees(person.PersonId).catch(() => []),
					getPersonSponsored(person.PersonId, 15).catch(() => [])
				]);

				localRepCommittees = committees
					.filter(c => c.OfficeRecordBodyName !== 'Metropolitan Council')
					.map(c => ({
						name: c.OfficeRecordBodyName,
						title: c.OfficeRecordTitle || 'Member'
					}));

				// Summarize sponsored bills with AI (10s budget)
				try {
					const summarized = await Promise.race([
						summarizeLegislation(sponsoredRaw),
						new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
					]);
					if (summarized) {
						localRepBills = summarized.map(b => ({
							fileNumber: b.fileNumber,
							title: b.title,
							summary: b.summary,
							tension: b.tension,
							status: b.statusExplained,
							controversyScore: b.controversyScore,
							sourceUrl: b.sourceUrl
						}));
					}
				} catch {
					// Timeout — return raw bills
					localRepBills = sponsoredRaw.map(m => ({
						fileNumber: m.MatterFile,
						title: m.MatterTitle || m.MatterName,
						summary: '',
						tension: '',
						status: m.MatterStatusName,
						controversyScore: 0,
						sourceUrl: `https://nashville.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}`
					}));
				}

				// Generate narrative with real data
				localRepNarrative = await summarizeRepActivity(
					localRep.name,
					localRep.office,
					sponsoredRaw.map(m => ({
						MatterFile: m.MatterFile,
						MatterTitle: m.MatterTitle || m.MatterName,
						MatterTypeName: m.MatterTypeName,
						MatterStatusName: m.MatterStatusName
					})),
					localRepCommittees.map(c => c.name)
				).catch(() => '');
			}
		} catch {
			// Legistar lookup failed — continue without detail data
		}
	}

	const mayor: Representative = {
		name: "Freddie O'Connell",
		office: 'Mayor of Nashville',
		level: 'local',
		party: 'Democratic',
		phone: '(615) 862-6000',
		email: 'mayor@nashville.gov',
		website: 'https://www.nashville.gov/departments/mayor'
	};

	const federalReps = civicReps.filter((r) => r.level === 'federal');
	const finalStateReps = stateReps.length > 0 ? stateReps : civicReps.filter((r) => r.level === 'state');

	return {
		address,
		district: districtResult?.district ?? null,
		localRep,
		localRepNarrative,
		localRepCommittees,
		localRepBills,
		stateReps: finalStateReps,
		federalReps,
		mayor,
		error: null
	};
};
