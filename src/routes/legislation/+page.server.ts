import { getSharedLegislation } from '$lib/server/data';
import type { NarrativeLegislation } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Same data as homepage — shared cache, no redundant Claude calls
	const aiData: Promise<NarrativeLegislation[]> = getSharedLegislation().catch(() => []);

	return { aiData };
};
