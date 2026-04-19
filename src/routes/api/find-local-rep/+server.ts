import { json, type RequestEvent } from '@sveltejs/kit';
import { geocodeAddress } from '$lib/server/geocode';
import { findDistrict } from '$lib/server/districts';
import { getStateLegislators } from '$lib/server/openstates';
import type { Representative } from '$lib/types';

type Rep = { name: string; email: string; level: 'local' | 'state'; office?: string };

export const GET = async ({ url }: RequestEvent) => {
	const address = url.searchParams.get('address')?.trim();
	if (!address) {
		return json({ error: 'Address is required.' }, { status: 400 });
	}

	const geo = await geocodeAddress(address);
	if (!geo) {
		return json(
			{ error: "We couldn't find that address. Try a zip code, street address, or neighborhood." },
			{ status: 404 }
		);
	}

	const districtResult = findDistrict(geo.lat, geo.lng);
	const localRep = districtResult?.representative;

	const stateReps: Representative[] = await getStateLegislators(geo.lat, geo.lng).catch(() => []);

	const local: Rep | null = localRep?.email
		? { name: localRep.name, email: localRep.email, level: 'local', office: localRep.office }
		: null;

	const state: Rep[] = stateReps
		.filter(r => !!r.email)
		.map(r => ({ name: r.name, email: r.email as string, level: 'state', office: r.office }));

	return json({
		district: districtResult?.district,
		local,
		state
	});
};
