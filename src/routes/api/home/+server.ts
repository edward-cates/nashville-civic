import { json, type RequestHandler } from '@sveltejs/kit';
import { getSharedMeetings, getSharedLegislation, buildStoryCards } from '$lib/server/data';

export const GET: RequestHandler = async () => {
	const [meetings, legislation] = await Promise.all([
		getSharedMeetings(),
		getSharedLegislation()
	]);

	const storyCards = buildStoryCards(meetings, legislation);

	return json({ meetings, legislation, storyCards });
};
