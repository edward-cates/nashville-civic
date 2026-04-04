import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Each gets its own promise from the shared layer (deduped internally)
	const meetings = getSharedMeetings().catch(() => []);
	const legislation = getSharedLegislation().catch(() => []);

	// Story cards: separate call to shared layer (deduped, won't re-fetch)
	const storyCards = Promise.all([
		getSharedMeetings().catch(() => []),
		getSharedLegislation().catch(() => [])
	]).then(([m, l]) => buildStoryCards(m, l)).catch(() => []);

	return { meetings, legislation, storyCards };
};
