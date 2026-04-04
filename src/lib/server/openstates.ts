import { env } from '$env/dynamic/private';
import type { Representative } from '$lib/types';

const OPENSTATES_URL = 'https://v3.openstates.org';

interface OpenStatesPerson {
	name: string;
	party: string;
	current_role: {
		title: string;
		district: string;
		org_classification: string;
	};
	email?: string;
	image?: string;
	links?: { url: string }[];
	offices?: { voice?: string; address?: string }[];
}

export async function getStateLegislators(lat: number, lng: number): Promise<Representative[]> {
	const apiKey = env.OPEN_STATES_API_KEY;
	if (!apiKey) {
		console.warn('OPEN_STATES_API_KEY not set, skipping Open States API');
		return [];
	}

	const params = new URLSearchParams({
		lat: lat.toString(),
		lng: lng.toString(),
		include: 'links,offices'
	});

	const res = await fetch(`${OPENSTATES_URL}/people.geo?${params}`, {
		headers: { 'X-API-KEY': apiKey }
	});

	if (!res.ok) {
		console.error('Open States API error:', res.status, await res.text());
		return [];
	}

	const data = await res.json();
	const results: OpenStatesPerson[] = data.results || [];

	return results.map((person) => ({
		name: person.name,
		office: `TN ${person.current_role.org_classification === 'upper' ? 'State Senator' : 'State Representative'}`,
		level: 'state' as const,
		party: person.party || undefined,
		district: person.current_role.district || undefined,
		email: person.email || undefined,
		photoUrl: person.image || undefined,
		website: person.links?.[0]?.url || undefined,
		phone: person.offices?.[0]?.voice || undefined,
		address: person.offices?.[0]?.address || undefined
	}));
}
