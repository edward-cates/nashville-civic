/**
 * Shared data layer — single source of truth for legislation and meetings.
 * Both the homepage and bills page read from this. Data is fetched once,
 * summarized once, cached once.
 */

import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from './legistar';
import { getRecentStateBills } from './openstates';
import { summarizeLegislation, summarizeStateBills, summarizeMeetingsWithAgenda, generateStoryCards } from './narrative';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from './narrative';

// In-flight dedup for the shared data fetches
let meetingsInflight: Promise<NarrativeMeeting[]> | null = null;
let meetingsExpires = 0;
let legislationInflight: Promise<NarrativeLegislation[]> | null = null;
let legislationExpires = 0;

const DEDUP_TTL = 30_000; // 30s — dedup window for concurrent page loads

export async function getSharedMeetings(): Promise<NarrativeMeeting[]> {
	if (meetingsInflight && Date.now() < meetingsExpires) return meetingsInflight;

	meetingsExpires = Date.now() + DEDUP_TTL;
	meetingsInflight = (async () => {
		const rawMeetings = await getUpcomingMeetings(8);

		const agendaItemsByEvent = new Map();
		await Promise.all(
			rawMeetings.map(async (event) => {
				const items = await getEventAgendaItems(event.EventId).catch(() => []);
				agendaItemsByEvent.set(event.EventId, items);
			})
		);

		return summarizeMeetingsWithAgenda(rawMeetings, agendaItemsByEvent);
	})();

	return meetingsInflight;
}

export async function getSharedLegislation(): Promise<NarrativeLegislation[]> {
	if (legislationInflight && Date.now() < legislationExpires) return legislationInflight;

	legislationExpires = Date.now() + DEDUP_TTL;
	legislationInflight = (async () => {
		const [rawMetro, rawState] = await Promise.all([
			getRecentLegislation(30),
			getRecentStateBills(20).catch(() => [])
		]);

		const [metro, state] = await Promise.all([
			summarizeLegislation(rawMetro),
			summarizeStateBills(rawState).catch(() => [])
		]);

		return [...metro, ...state];
	})();

	return legislationInflight;
}

export function buildStoryCards(meetings: NarrativeMeeting[], legislation: NarrativeLegislation[]): StoryCard[] {
	return generateStoryCards(meetings, legislation);
}
