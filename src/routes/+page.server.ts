import { getUpcomingMeetings, getRecentLegislation } from '$lib/server/legistar';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [meetings, legislation] = await Promise.all([
		getUpcomingMeetings(6),
		getRecentLegislation(10)
	]);

	return { meetings, legislation };
};
