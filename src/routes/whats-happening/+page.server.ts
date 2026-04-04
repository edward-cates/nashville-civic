import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [meetings, legislation] = await Promise.all([
		getSharedMeetings(),
		getSharedLegislation()
	]);

	const storyCards = buildStoryCards(meetings, legislation);

	return { meetings, legislation, storyCards };
};
