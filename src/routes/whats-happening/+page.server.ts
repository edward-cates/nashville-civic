import { getUpcomingMeetings, getRecentLegislation } from '$lib/server/legistar';
import {
	summarizeLegislation,
	summarizeMeetings,
	generateWeeklyDigest
} from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [rawMeetings, rawLegislation] = await Promise.all([
		getUpcomingMeetings(8),
		getRecentLegislation(12)
	]);

	const [meetings, legislation, weeklyDigest] = await Promise.all([
		summarizeMeetings(rawMeetings),
		summarizeLegislation(rawLegislation),
		generateWeeklyDigest(rawMeetings.slice(0, 5), rawLegislation.slice(0, 8))
	]);

	return { meetings, legislation, weeklyDigest };
};
