import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from '$lib/server/legistar';
import { summarizeLegislation, summarizeMeetingsWithAgenda, generateStoryCards } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rawMeetings, rawLegislation] = await Promise.all([
		getUpcomingMeetings(8),
		getRecentLegislation(20)
	]);

	const agendaItemsByEvent = new Map();
	await Promise.all(
		rawMeetings.map(async (event) => {
			const items = await getEventAgendaItems(event.EventId).catch(() => []);
			agendaItemsByEvent.set(event.EventId, items);
		})
	);

	const [meetings, legislation] = await Promise.all([
		summarizeMeetingsWithAgenda(rawMeetings, agendaItemsByEvent),
		summarizeLegislation(rawLegislation)
	]);

	const storyCards = generateStoryCards(meetings, legislation);

	return { meetings, legislation, storyCards };
};
