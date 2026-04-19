import { geocodeAddress } from '$lib/server/geocode';
import { getRepresentatives } from '$lib/server/civic';
import { getAllLegislators, searchStateBills } from '$lib/server/openstates';
import { findDistrict } from '$lib/server/districts';
import { getPersonByName, getPersonSponsored, getPersonCommittees, getCouncilMembers } from '$lib/server/legistar';
import { summarizeLegislation, summarizeStateBills, summarizeRepActivity } from '$lib/server/narrative';
import type { Representative } from '$lib/types';
import type { PageServerLoad } from './$types';

type RepBill = {
	fileNumber: string; title: string; summary: string; tension: string;
	status: string; controversyScore: number; sourceUrl: string; level: 'local' | 'state';
};

const mayor: Representative = {
	name: "Freddie O'Connell",
	office: 'Mayor of Nashville',
	level: 'local',
	party: 'Democratic',
	phone: '(615) 862-6000',
	email: 'mayor@nashville.gov',
	website: 'https://www.nashville.gov/departments/mayor'
};

const governor: Representative = {
	name: 'Bill Lee',
	office: 'Governor of Tennessee',
	level: 'state',
	party: 'Republican',
	phone: '(615) 741-2001',
	email: 'bill.lee@tn.gov',
	website: 'https://www.tn.gov/governor'
};

export const load: PageServerLoad = async ({ url }) => {
	const address = url.searchParams.get('address');

	// --- DEFAULT VIEW: no address, show Nashville-wide reps ---
	if (!address) {
		// Fetch at-large council members from the GeoJSON (districts > 35 or look for at-large)
		// For now just show the key universal reps
		return {
			address: null,
			mode: 'default' as const,
			district: null,
			localRep: null,
			localRepNarrative: '',
			localRepCommittees: [],
			localRepBills: [] as RepBill[],
			stateReps: [governor],
			stateRepBills: [] as RepBill[],
			federalReps: [] as Representative[],
			mayor,
			error: null
		};
	}

	// --- ADDRESS VIEW: personalized reps ---
	const geo = await geocodeAddress(address);
	if (!geo) {
		return {
			address,
			mode: 'address' as const,
			district: null,
			localRep: null,
			localRepNarrative: '',
			localRepCommittees: [],
			localRepBills: [] as RepBill[],
			stateReps: [] as Representative[],
			stateRepBills: [] as RepBill[],
			federalReps: [] as Representative[],
			mayor,
			error: 'We couldn\'t find that address. Try a zip code (37203), street address, or neighborhood name.'
		};
	}

	const districtResult = findDistrict(geo.lat, geo.lng);

	const [civicReps, openStatesReps] = await Promise.all([
		getRepresentatives(address).catch(() => [] as Representative[]),
		getAllLegislators(geo.lat, geo.lng).catch(() => ({
			state: [] as Representative[],
			federal: [] as Representative[]
		}))
	]);
	const stateReps = openStatesReps.state;

	const localRep = districtResult?.representative || null;

	// --- Council member detail ---
	let localRepCommittees: Array<{ name: string; title: string }> = [];
	let localRepBills: RepBill[] = [];
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
					.map(c => ({ name: c.OfficeRecordBodyName, title: c.OfficeRecordTitle || 'Member' }));

				try {
					const summarized = await Promise.race([
						summarizeLegislation(sponsoredRaw),
						new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
					]);
					if (summarized) {
						localRepBills = summarized.map(b => ({
							fileNumber: b.fileNumber, title: b.title, summary: b.summary,
							tension: b.tension, status: b.statusExplained,
							controversyScore: b.controversyScore, sourceUrl: b.sourceUrl, level: 'local' as const
						}));
					}
				} catch {
					localRepBills = sponsoredRaw.map(m => ({
						fileNumber: m.MatterFile, title: m.MatterTitle || m.MatterName,
						summary: '', tension: '', status: m.MatterStatusName,
						controversyScore: 0, sourceUrl: `https://nashville.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}`,
						level: 'local' as const
					}));
				}

				localRepNarrative = await summarizeRepActivity(
					localRep.name, localRep.office,
					sponsoredRaw.map(m => ({
						MatterFile: m.MatterFile, MatterTitle: m.MatterTitle || m.MatterName,
						MatterTypeName: m.MatterTypeName, MatterStatusName: m.MatterStatusName
					})),
					localRepCommittees.map(c => c.name)
				).catch(() => '');
			}
		} catch { /* continue without detail */ }
	}

	// --- State rep bills ---
	let stateRepBills: RepBill[] = [];
	const finalStateReps = stateReps.length > 0 ? stateReps : civicReps.filter(r => r.level === 'state');

	if (finalStateReps.length > 0) {
		try {
			// Search bills by each state rep's last name (in parallel)
			const billsByRep = await Promise.race([
				Promise.all(finalStateReps.map(rep => {
					const lastName = rep.name.split(' ').pop() || rep.name;
					return searchStateBills(lastName, 5).catch(() => []);
				})),
				new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
			]);

			if (billsByRep) {
				// Flatten, dedupe by identifier
				const seen = new Set<string>();
				const allStateBills = [];
				for (const bills of billsByRep) {
					for (const bill of bills) {
						if (!seen.has(bill.identifier)) {
							seen.add(bill.identifier);
							allStateBills.push(bill);
						}
					}
				}

				try {
					const summarized = await Promise.race([
						summarizeStateBills(allStateBills.slice(0, 10)),
						new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
					]);
					if (summarized) {
						stateRepBills = summarized.map(b => ({
							fileNumber: b.fileNumber, title: b.title, summary: b.summary,
							tension: b.tension, status: b.statusExplained,
							controversyScore: b.controversyScore, sourceUrl: b.sourceUrl, level: 'state' as const
						}));
					}
				} catch {
					stateRepBills = allStateBills.slice(0, 10).map(b => ({
						fileNumber: b.identifier, title: b.title,
						summary: '', tension: '', status: b.latest_action_description || '',
						controversyScore: 0, sourceUrl: b.openstates_url, level: 'state' as const
					}));
				}
			}
		} catch { /* timeout — skip state bills */ }
	}

	// Add governor to state reps list
	const allStateReps = [governor, ...finalStateReps];

	// Federal reps: prefer Google Civic (has photos + channels), fall back to OpenStates.
	const civicFederal = civicReps.filter(r => r.level === 'federal');
	const federalReps = civicFederal.length > 0 ? civicFederal : openStatesReps.federal;

	return {
		address,
		mode: 'address' as const,
		district: districtResult?.district ?? null,
		localRep,
		localRepNarrative,
		localRepCommittees,
		localRepBills,
		stateReps: allStateReps,
		stateRepBills,
		federalReps,
		mayor,
		error: null
	};
};
