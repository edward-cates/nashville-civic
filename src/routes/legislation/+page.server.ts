import { getRecentLegislation } from '$lib/server/legistar';
import { getRecentStateBills } from '$lib/server/openstates';
import { summarizeLegislation, summarizeStateBills } from '$lib/server/narrative';
import type { NarrativeLegislation } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fast: raw API data (these resolve quickly)
	const [rawMetro, rawState] = await Promise.all([
		getRecentLegislation(30),
		getRecentStateBills(20).catch(() => [])
	]);

	const rawCount = rawMetro.length + rawState.length;

	// Slow: AI summarization — streamed as un-awaited promise
	const aiData: Promise<NarrativeLegislation[]> = (async () => {
		const [metro, state] = await Promise.all([
			summarizeLegislation(rawMetro),
			summarizeStateBills(rawState).catch(() => [])
		]);

		return [...metro, ...state];
	})();

	return {
		rawCount,
		aiData
	};
};
