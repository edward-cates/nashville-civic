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
