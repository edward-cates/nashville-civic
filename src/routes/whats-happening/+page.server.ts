import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from '$lib/server/legistar';
import { getRecentStateBills } from '$lib/server/openstates';
import { summarizeLegislation, summarizeStateBills, summarizeMeetingsWithAgenda, generateStoryCards } from '$lib/server/narrative';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fast: raw API data
	const [rawMeetings, rawMetro, rawState] = await Promise.all([
		getUpcomingMeetings(8),
		getRecentLegislation(20),
		getRecentStateBills(15).catch(() => [])
	]);

	const agendaItemsByEvent = new Map();
	await Promise.all(
		rawMeetings.map(async (event) => {
			const items = await getEventAgendaItems(event.EventId).catch(() => []);
			agendaItemsByEvent.set(event.EventId, items);
		})
	);

	// Slow: AI — streamed as promise
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

	return {
		meetingCount: rawMeetings.length,
		legislationCount: rawMetro.length + rawState.length,
		aiData
	};
};
