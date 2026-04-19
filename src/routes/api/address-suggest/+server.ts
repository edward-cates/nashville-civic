import { json, type RequestEvent } from '@sveltejs/kit';
import { suggestAddresses } from '$lib/server/geocode';

export const GET = async ({ url }: RequestEvent) => {
	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 3) {
		return json({ suggestions: [] });
	}

	const results = await suggestAddresses(q, 5).catch(() => []);
	return json({
		suggestions: results.map(r => ({ displayName: r.displayName, lat: r.lat, lng: r.lng }))
	});
};
