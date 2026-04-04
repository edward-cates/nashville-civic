import { getSharedLegislation } from '$lib/server/data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const legislation = await getSharedLegislation();
	return { legislation };
};
