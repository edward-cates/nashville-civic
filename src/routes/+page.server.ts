import { getUpcomingMeetings, getRecentLegislation, getEventAgendaItems } from '$lib/server/legistar';
import { summarizeLegislation, summarizeMeetingsWithAgenda, generateWeeklyDigest } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rawMeetings, rawLegislation] = await Promise.all([
		getUpcomingMeetings(6),
		getRecentLegislation(15)
	]);

	// Fetch agenda items for each meeting in parallel
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

	const weeklyDigest = await generateWeeklyDigest(meetings, legislation);

	return { meetings, legislation, weeklyDigest };
};
