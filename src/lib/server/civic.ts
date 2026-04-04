import { env } from '$env/dynamic/private';
import type { Representative } from '$lib/types';

const CIVIC_API_URL = 'https://www.googleapis.com/civicinfo/v2';

interface CivicAddress {
	line1: string;
	city: string;
	state: string;
	zip: string;
}

interface CivicOfficial {
	name: string;
	party?: string;
	phones?: string[];
	urls?: string[];
	emails?: string[];
	photoUrl?: string;
	channels?: { type: string; id: string }[];
	address?: CivicAddress[];
}

interface CivicOffice {
	name: string;
	divisionId: string;
	levels?: string[];
	officialIndices: number[];
}

function levelFromOfficeLevels(levels?: string[]): 'local' | 'state' | 'federal' {
	if (!levels || levels.length === 0) return 'local';
	if (levels.includes('country')) return 'federal';
	if (levels.includes('administrativeArea1')) return 'state';
	return 'local';
}

export async function getRepresentatives(address: string): Promise<Representative[]> {
	const apiKey = env.GOOGLE_CIVIC_API_KEY;
	if (!apiKey) {
		console.warn('GOOGLE_CIVIC_API_KEY not set, skipping Google Civic API');
		return [];
	}

	const params = new URLSearchParams({ address, key: apiKey });
	const res = await fetch(`${CIVIC_API_URL}/representatives?${params}`);

	if (!res.ok) {
		console.error('Google Civic API error:', res.status, await res.text());
		return [];
	}

	const data = await res.json();
	const officials: CivicOfficial[] = data.officials || [];
	const offices: CivicOffice[] = data.offices || [];
	const reps: Representative[] = [];

	for (const office of offices) {
		const level = levelFromOfficeLevels(office.levels);
		for (const idx of office.officialIndices) {
			const official = officials[idx];
			if (!official) continue;

			reps.push({
				name: official.name,
				office: office.name,
				level,
				party: official.party || undefined,
				phone: official.phones?.[0] || undefined,
				email: official.emails?.[0] || undefined,
				website: official.urls?.[0] || undefined,
				photoUrl: official.photoUrl || undefined,
				channels: official.channels || undefined,
				address: official.address?.[0]
					? `${official.address[0].line1}, ${official.address[0].city}, ${official.address[0].state} ${official.address[0].zip}`
					: undefined
			});
		}
	}

	return reps;
}
