import type { GeocodingResult } from '$lib/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
	const params = new URLSearchParams({
		q: address,
		format: 'json',
		limit: '1',
		countrycodes: 'us',
		viewbox: '-87.05,36.7,-86.5,35.95', // Nashville bounding box
		bounded: '0'
	});

	const res = await fetch(`${NOMINATIM_URL}?${params}`, {
		headers: { 'User-Agent': 'NashvilleCivic/1.0 (civic engagement tool)' }
	});

	if (!res.ok) return null;

	const data = await res.json();
	if (!data.length) return null;

	return {
		lat: parseFloat(data[0].lat),
		lng: parseFloat(data[0].lon),
		displayName: data[0].display_name
	};
}
