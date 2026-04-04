import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const meetings = getSharedMeetings().catch(() => []);
	const legislation = getSharedLegislation().catch(() => []);

	// Separate calls — deduped internally, avoids promise chain issues with SSR
	const storyCards = Promise.all([
		getSharedMeetings().catch(() => []),
		getSharedLegislation().catch(() => [])
	]).then(([m, l]) => buildStoryCards(m, l)).catch(() => []);

	return { meetings, legislation, storyCards };
};
