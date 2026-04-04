import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';
import type { NarrativeLegislation, NarrativeMeeting, StoryCard } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Stream each piece independently — whichever finishes first shows first
	const meetings: Promise<NarrativeMeeting[]> = getSharedMeetings().catch(() => []);
	const legislation: Promise<NarrativeLegislation[]> = getSharedLegislation().catch(() => []);

	// Story cards depend on both, so they stream after both resolve
	const storyCards: Promise<StoryCard[]> = Promise.all([meetings, legislation])
		.then(([m, l]) => buildStoryCards(m, l))
		.catch(() => []);

	return { meetings, legislation, storyCards };
};
