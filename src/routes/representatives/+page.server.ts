import { geocodeAddress } from '$lib/server/geocode';
import { getRepresentatives } from '$lib/server/civic';
import { getStateLegislators } from '$lib/server/openstates';
import { findDistrict } from '$lib/server/districts';
import type { Representative } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const address = url.searchParams.get('address');
	if (!address) {
		return { address: null, reps: [], displayAddress: '', district: null, error: null };
	}

	const geo = await geocodeAddress(address);
	if (!geo) {
		return {
			address,
			reps: [],
			displayAddress: address,
			district: null,
			error: 'Could not find that address. Please try a full Nashville address (e.g., "123 Broadway, Nashville, TN 37203").'
		};
	}

	// Find council district — GeoJSON includes rep name, email, phone, website
	const districtResult = findDistrict(geo.lat, geo.lng);

	// Fetch external APIs in parallel
	const [civicReps, stateReps] = await Promise.all([
		getRepresentatives(address).catch(() => [] as Representative[]),
		getStateLegislators(geo.lat, geo.lng).catch(() => [] as Representative[])
	]);

	// Build local reps from district GeoJSON (instant, no API call)
	const localReps: Representative[] = [];
	if (districtResult) {
		localReps.push(districtResult.representative);
	}

	// Mayor (static)
	localReps.push({
		name: 'Freddie O\'Connell',
		office: 'Mayor of Nashville',
		level: 'local',
		party: 'Democratic',
		phone: '(615) 862-6000',
		email: 'mayor@nashville.gov',
		website: 'https://www.nashville.gov/departments/mayor'
	});

	// Federal reps from Google Civic
	const federalReps = civicReps.filter((r) => r.level === 'federal');

	// State reps: prefer Open States, fall back to Google Civic
	const finalStateReps = stateReps.length > 0
		? stateReps
		: civicReps.filter((r) => r.level === 'state');

	// Merge any additional local reps from Google Civic (deduped)
	const civicLocalReps = civicReps.filter((r) => r.level === 'local');
	for (const rep of civicLocalReps) {
		const isDuplicate = localReps.some(
			(existing) => existing.name.toLowerCase() === rep.name.toLowerCase()
		);
		if (!isDuplicate) {
			localReps.push(rep);
		}
	}

	const reps = [...localReps, ...finalStateReps, ...federalReps];

	return {
		address,
		reps,
		displayAddress: geo.displayName,
		district: districtResult?.district ?? null,
		error: null
	};
};
