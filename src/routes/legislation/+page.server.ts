import { getRecentLegislation } from '$lib/server/legistar';
import { summarizeLegislation } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rawLegislation = await getRecentLegislation(50);
	const legislation = await summarizeLegislation(rawLegislation);
	return { legislation };
};
