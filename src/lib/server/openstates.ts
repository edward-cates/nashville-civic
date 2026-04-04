import { env } from '$env/dynamic/private';
import type { Representative } from '$lib/types';

const OPENSTATES_URL = 'https://v3.openstates.org';

function getApiKey(): string | null {
	const apiKey = env.OPEN_STATES_API_KEY;
	if (!apiKey) {
		console.warn('OPEN_STATES_API_KEY not set, skipping Open States API');
		return null;
	}
	return apiKey;
}

async function openStatesFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
	const apiKey = getApiKey();
	if (!apiKey) return null;

	const url = new URL(`${OPENSTATES_URL}${endpoint}`);
	if (params) {
		for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
	}

	const res = await fetch(url.toString(), { headers: { 'X-API-KEY': apiKey } });
	if (!res.ok) {
		console.error(`Open States API error at ${endpoint}:`, res.status);
		return null;
	}
	return res.json();
}

// --- People ---

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
	const data = await openStatesFetch<{ results: OpenStatesPerson[] }>('/people.geo', {
		lat: lat.toString(),
		lng: lng.toString(),
		include: 'links,offices'
	});

	if (!data?.results) return [];

	return data.results.map((person) => ({
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

// --- Bills ---

export interface StateBill {
	id: string;
	identifier: string; // e.g. "HB1234" or "SB567"
	title: string;
	session: string;
	classification: string[]; // ["bill"], ["resolution"], etc.
	subject: string[];
	openstates_url: string;
	updated_at: string;
	created_at: string;
	from_organization?: { name: string }; // "Tennessee House" or "Tennessee Senate"
	latest_action_description?: string;
	latest_action_date?: string;
	sponsorships?: Array<{
		name: string;
		classification: string; // "primary" or "cosponsor"
		person_name?: string;
	}>;
	abstracts?: Array<{ abstract: string }>;
}

interface BillSearchResponse {
	results: StateBill[];
	pagination: { total_items: number; per_page: number; page: number; max_page: number };
}

export async function getRecentStateBills(limit = 20): Promise<StateBill[]> {
	const data = await openStatesFetch<BillSearchResponse>('/bills', {
		jurisdiction: 'Tennessee',
		sort: 'updated_desc',
		per_page: limit.toString(),
		include: 'sponsorships,abstracts'
	});

	return data?.results || [];
}

export async function searchStateBills(query: string, limit = 20): Promise<StateBill[]> {
	const data = await openStatesFetch<BillSearchResponse>('/bills', {
		jurisdiction: 'Tennessee',
		q: query,
		sort: 'updated_desc',
		per_page: limit.toString(),
		include: 'sponsorships,abstracts'
	});

	return data?.results || [];
}
