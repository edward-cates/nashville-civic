import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from '$lib/server/legistar';
import { getRecentStateBills } from '$lib/server/openstates';
import { summarizeLegislation, summarizeStateBills, summarizeMeetingsWithAgenda, generateStoryCards } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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

	const [meetings, metroLeg, stateLeg] = await Promise.all([
		summarizeMeetingsWithAgenda(rawMeetings, agendaItemsByEvent),
		summarizeLegislation(rawMetro),
		summarizeStateBills(rawState).catch(() => [])
	]);

	const legislation = [...metroLeg, ...stateLeg];
	const storyCards = generateStoryCards(meetings, legislation);

	return { meetings, legislation, storyCards };
};
