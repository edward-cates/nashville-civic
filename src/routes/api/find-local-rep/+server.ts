import { json, type RequestEvent } from '@sveltejs/kit';
import { geocodeAddress } from '$lib/server/geocode';
import { findDistrict } from '$lib/server/districts';

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
	const rep = districtResult?.representative;

	if (!rep) {
		return json(
			{ error: "We couldn't find a Metro Council district for that address." },
			{ status: 404 }
		);
	}

	if (!rep.email) {
		return json(
			{
				error: `We found your council member (${rep.name}) but don't have an email on file.`,
				district: districtResult?.district,
				rep: { name: rep.name, email: '', level: rep.level }
			},
			{ status: 422 }
		);
	}

	return json({
		district: districtResult?.district,
		rep: { name: rep.name, email: rep.email, level: rep.level }
	});
};
