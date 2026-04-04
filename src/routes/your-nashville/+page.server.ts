import { geocodeAddress } from '$lib/server/geocode';
import { getRepresentatives } from '$lib/server/civic';
import { getStateLegislators } from '$lib/server/openstates';
import { findDistrict } from '$lib/server/districts';
import { summarizeRepActivity } from '$lib/server/narrative';
import type { Representative } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const address = url.searchParams.get('address');
	if (!address) {
		return {
			address: null,
			district: null,
			localRep: null,
			localRepNarrative: '',
			stateReps: [],
			federalReps: [],
			mayor: null,
			error: null
		};
	}

	const geo = await geocodeAddress(address);
	if (!geo) {
		return {
			address,
			district: null,
			localRep: null,
			localRepNarrative: '',
			stateReps: [] as Representative[],
			federalReps: [] as Representative[],
			mayor: null,
			error: 'We couldn\'t find that address. Try entering your full Nashville address, like "123 Broadway, Nashville, TN 37203".'
		};
	}

	const districtResult = findDistrict(geo.lat, geo.lng);

	const [civicReps, stateReps] = await Promise.all([
		getRepresentatives(address).catch(() => [] as Representative[]),
		getStateLegislators(geo.lat, geo.lng).catch(() => [] as Representative[])
	]);

	const localRep = districtResult?.representative || null;

	// Generate narrative for the council member
	let localRepNarrative = '';
	if (localRep) {
		localRepNarrative = await summarizeRepActivity(
			localRep.name,
			localRep.office,
			[], // We'll add sponsored legislation later
			[] // We'll add committee data later
		).catch(() => '');
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
	const finalStateReps =
		stateReps.length > 0 ? stateReps : civicReps.filter((r) => r.level === 'state');

	return {
		address,
		district: districtResult?.district ?? null,
		localRep,
		localRepNarrative,
		stateReps: finalStateReps,
		federalReps,
		mayor,
		error: null
	};
};
