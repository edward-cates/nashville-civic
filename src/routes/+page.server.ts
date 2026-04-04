import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from '$lib/server/legistar';
import { getRecentStateBills } from '$lib/server/openstates';
import { summarizeLegislation, summarizeStateBills, summarizeMeetingsWithAgenda, generateStoryCards } from '$lib/server/narrative';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fast: fetch raw data from APIs (no AI)
	const [rawMeetings, rawMetro, rawState] = await Promise.all([
		getUpcomingMeetings(6),
		getRecentLegislation(15),
		getRecentStateBills(10).catch(() => [])
	]);

	const agendaItemsByEvent = new Map();
	await Promise.all(
		rawMeetings.map(async (event) => {
			const items = await getEventAgendaItems(event.EventId).catch(() => []);
			agendaItemsByEvent.set(event.EventId, items);
		})
	);

	// Slow: AI summaries — return as a promise that streams to the client
	const aiData: Promise<{
		meetings: NarrativeMeeting[];
		legislation: NarrativeLegislation[];
		storyCards: StoryCard[];
	}> = (async () => {
		const [meetings, metroLeg, stateLeg] = await Promise.all([
			summarizeMeetingsWithAgenda(rawMeetings, agendaItemsByEvent),
			summarizeLegislation(rawMetro),
			summarizeStateBills(rawState).catch(() => [])
		]);
		const legislation = [...metroLeg, ...stateLeg];
		const storyCards = generateStoryCards(meetings, legislation);
		return { meetings, legislation, storyCards };
	})();

	// Return raw counts immediately for the loading state
	return {
		meetingCount: rawMeetings.length,
		legislationCount: rawMetro.length + rawState.length,
		aiData // streamed promise
	};
};
