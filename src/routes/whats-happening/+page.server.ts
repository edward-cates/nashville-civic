import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Same shared data as homepage — no redundant fetches or Claude calls
	const meetings: Promise<NarrativeMeeting[]> = getSharedMeetings().catch(() => []);
	const legislation: Promise<NarrativeLegislation[]> = getSharedLegislation().catch(() => []);
	const storyCards: Promise<StoryCard[]> = Promise.all([meetings, legislation])
		.then(([m, l]) => buildStoryCards(m, l))
		.catch(() => []);

	return { meetings, legislation, storyCards };
};
