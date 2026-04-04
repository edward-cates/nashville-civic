/**
 * Shared data layer — single source of truth for legislation and meetings.
 * All pages read from this. Data is fetched once, summarized once, cached once.
 */

import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from './legistar';
import { getRecentStateBills } from './openstates';
import { summarizeLegislation, summarizeStateBills, summarizeMeetingsWithAgenda, generateStoryCards } from './narrative';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from './narrative';

// In-flight dedup — short window to prevent concurrent page loads from doubling up
let meetingsInflight: Promise<NarrativeMeeting[]> | null = null;
let meetingsExpires = 0;
let legislationInflight: Promise<NarrativeLegislation[]> | null = null;
let legislationExpires = 0;

const DEDUP_TTL = 30_000;

export async function getSharedMeetings(): Promise<NarrativeMeeting[]> {
	if (meetingsInflight && Date.now() < meetingsExpires) return meetingsInflight;

	meetingsExpires = Date.now() + DEDUP_TTL;
	meetingsInflight = (async () => {
		console.log('[data] Fetching meetings from Legistar...');
		const rawMeetings = await getUpcomingMeetings(8);
		console.log(`[data] Got ${rawMeetings.length} raw meetings`);

		const agendaItemsByEvent = new Map();
		await Promise.all(
			rawMeetings.map(async (event) => {
				const items = await getEventAgendaItems(event.EventId).catch(() => []);
				agendaItemsByEvent.set(event.EventId, items);
			})
		);

		console.log('[data] Summarizing meetings with Claude...');
		const result = await summarizeMeetingsWithAgenda(rawMeetings, agendaItemsByEvent);
		console.log(`[data] Got ${result.length} summarized meetings`);
		return result;
	})().catch(err => {
		console.error('[data] Meetings pipeline failed:', err);
		meetingsInflight = null; // clear so next request retries
		return [];
	});

	return meetingsInflight;
}

export async function getSharedLegislation(): Promise<NarrativeLegislation[]> {
	if (legislationInflight && Date.now() < legislationExpires) return legislationInflight;

	legislationExpires = Date.now() + DEDUP_TTL;
	legislationInflight = (async () => {
		console.log('[data] Fetching legislation...');
		const [rawMetro, rawState] = await Promise.all([
			getRecentLegislation(30),
			getRecentStateBills(20).catch(err => {
				console.error('[data] State bills fetch failed:', err);
				return [];
			})
		]);
		console.log(`[data] Got ${rawMetro.length} metro + ${rawState.length} state bills`);

		console.log('[data] Summarizing legislation with Claude...');
		const [metro, state] = await Promise.all([
			summarizeLegislation(rawMetro),
			summarizeStateBills(rawState).catch(err => {
				console.error('[data] State bill summarization failed:', err);
				return [];
			})
		]);
		console.log(`[data] Got ${metro.length} metro + ${state.length} state summaries`);
		return [...metro, ...state];
	})().catch(err => {
		console.error('[data] Legislation pipeline failed:', err);
		legislationInflight = null; // clear so next request retries
		return [];
	});

	return legislationInflight;
}

export function buildStoryCards(meetings: NarrativeMeeting[], legislation: NarrativeLegislation[]): StoryCard[] {
	return generateStoryCards(meetings, legislation);
}
