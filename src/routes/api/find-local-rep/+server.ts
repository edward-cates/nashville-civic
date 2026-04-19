import { json, type RequestEvent } from '@sveltejs/kit';
import { geocodeAddress } from '$lib/server/geocode';
import { findDistrict } from '$lib/server/districts';
import { getAllLegislators } from '$lib/server/openstates';
import type { Representative } from '$lib/types';

type Rep = {
	name: string;
	email: string;
	level: 'local' | 'state' | 'federal';
	office?: string;
};

function toRep(r: Representative, level: 'local' | 'state' | 'federal'): Rep | null {
	if (!r.email) return null;
	return { name: r.name, email: r.email, level, office: r.office };
}

export const GET = async ({ url }: RequestEvent) => {
	const address = url.searchParams.get('address')?.trim();
	if (!address) {
		return json({ error: 'Address is required.' }, { status: 400 });
	}

	const geo = await geocodeAddress(address);
	if (!geo) {
		return json(
			{ error: "We couldn't find that address. Try a street address, zip code, or neighborhood." },
			{ status: 404 }
		);
	}

	const districtResult = findDistrict(geo.lat, geo.lng);
	const localRep = districtResult?.representative;

	const openStatesReps = await getAllLegislators(geo.lat, geo.lng).catch(() => ({
		state: [] as Representative[],
		federal: [] as Representative[]
	}));

	const local: Rep | null = localRep ? toRep(localRep, 'local') : null;
	const state: Rep[] = openStatesReps.state
		.map(r => toRep(r, 'state'))
		.filter((r): r is Rep => r !== null);
	const federal: Rep[] = openStatesReps.federal
		.map(r => toRep(r, 'federal'))
		.filter((r): r is Rep => r !== null);

	return json({
		district: districtResult?.district,
		local,
		state,
		federal
	});
};
