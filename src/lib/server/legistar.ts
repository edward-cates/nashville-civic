import type { Representative, LegistarPerson, LegistarOfficeRecord } from '$lib/types';

const LEGISTAR_URL = 'https://webapi.legistar.com/v1/nashville';
const COUNCIL_BODY_ID = 138;

async function legistarFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
	const url = new URL(`${LEGISTAR_URL}${endpoint}`);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
	}

	const res = await fetch(url.toString());
	if (!res.ok) {
		console.error(`Legistar API error at ${endpoint}:`, res.status);
		return null;
	}
	return res.json();
}

export async function getCouncilMembers(): Promise<Representative[]> {
	const records = await legistarFetch<LegistarOfficeRecord[]>(
		`/Bodies/${COUNCIL_BODY_ID}/OfficeRecords`,
		{ '$filter': "OfficeRecordEndDate ge datetime'2026-01-01'" }
	);

	if (!records) return [];

	// Get full person details for each council member
	const reps: Representative[] = [];
	for (const record of records) {
		const person = await legistarFetch<LegistarPerson>(
			`/Persons/${record.OfficeRecordPersonId}`
		);

		if (!person) continue;

		// Extract district number from title if available
		const districtMatch = record.OfficeRecordTitle?.match(/District\s+(\d+)/i)
			|| record.OfficeRecordFullName?.match(/District\s+(\d+)/i);

		reps.push({
			name: person.PersonFullName,
			office: record.OfficeRecordTitle || 'Metro Council Member',
			level: 'local',
			district: districtMatch ? districtMatch[1] : undefined,
			phone: person.PersonPhone || undefined,
			email: person.PersonEmail || undefined,
			website: person.PersonWWW || undefined,
			address: person.PersonAddress1
				? `${person.PersonAddress1}, ${person.PersonCity1}, ${person.PersonState1} ${person.PersonZip1}`
				: undefined
		});
	}

	return reps;
}

export interface LegistarEvent {
	EventId: number;
	EventBodyName: string;
	EventDate: string;
	EventTime: string;
	EventLocation: string;
	EventAgendaFile: string;
	EventMinutesFile: string;
	EventVideoPath: string;
	EventInSiteURL: string;
}

export interface LegistarMatter {
	MatterId: number;
	MatterFile: string;
	MatterName: string;
	MatterTitle: string;
	MatterTypeName: string;
	MatterStatusName: string;
	MatterIntroDate: string;
	MatterPassedDate: string;
	MatterBodyName: string;
}

export async function getUpcomingMeetings(limit = 10): Promise<LegistarEvent[]> {
	const today = new Date().toISOString().split('T')[0];
	const events = await legistarFetch<LegistarEvent[]>('/Events', {
		'$filter': `EventDate ge datetime'${today}'`,
		'$orderby': 'EventDate',
		'$top': limit.toString()
	});

	return events || [];
}

export async function getRecentLegislation(limit = 20): Promise<LegistarMatter[]> {
	const matters = await legistarFetch<LegistarMatter[]>('/Matters', {
		'$orderby': 'MatterLastModifiedUtc desc',
		'$top': limit.toString()
	});

	return matters || [];
}

export interface LegistarEventItem {
	EventItemId: number;
	EventItemTitle: string;
	EventItemMatterId: number;
	EventItemMatterFile: string;
	EventItemMatterName: string;
	EventItemMatterType: string;
	EventItemMatterStatus: string;
	EventItemActionName: string;
	EventItemRollCallFlag: number;
}

export async function getEventAgendaItems(eventId: number): Promise<LegistarEventItem[]> {
	const items = await legistarFetch<LegistarEventItem[]>(
		`/Events/${eventId}/EventItems`,
		{ '$filter': 'EventItemMatterFile ne null' }
	);
	return items || [];
}

// --- Council member detail data ---

export interface LegistarSponsor {
	MatterSponsorNameId: number;
	MatterSponsorName: string;
	MatterSponsorMatterId: number;
}

export interface LegistarOfficeRecordDetail {
	OfficeRecordId: number;
	OfficeRecordFullName: string;
	OfficeRecordTitle: string;
	OfficeRecordBodyName: string;
	OfficeRecordStartDate: string;
	OfficeRecordEndDate: string;
}

export async function getPersonSponsored(personId: number, limit = 20): Promise<LegistarMatter[]> {
	// Get matters sponsored by this person
	const sponsors = await legistarFetch<LegistarSponsor[]>(
		'/MatterSponsors',
		{ '$filter': `MatterSponsorNameId eq ${personId}`, '$top': '50' }
	);
	if (!sponsors || !sponsors.length) return [];

	// Fetch the matter details for each sponsored item (in parallel, limited)
	const matterIds = sponsors.map(s => s.MatterSponsorMatterId).slice(0, limit);
	const matters = await Promise.all(
		matterIds.map(id => legistarFetch<LegistarMatter>(`/Matters/${id}`).catch(() => null))
	);

	return matters.filter((m): m is LegistarMatter => m !== null);
}

export async function getPersonCommittees(personId: number): Promise<LegistarOfficeRecordDetail[]> {
	const records = await legistarFetch<LegistarOfficeRecordDetail[]>(
		`/Persons/${personId}/OfficeRecords`,
		{ '$filter': `OfficeRecordEndDate ge datetime'2026-01-01'` }
	);
	return records || [];
}

export async function getPersonByName(name: string): Promise<{ PersonId: number } | null> {
	const persons = await legistarFetch<Array<{ PersonId: number; PersonFullName: string }>>(
		'/Persons',
		{ '$filter': `PersonFullName eq '${name}'`, '$top': '1' }
	);
	return persons?.[0] || null;
}
