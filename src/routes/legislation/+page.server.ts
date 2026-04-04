import { getRecentLegislation } from '$lib/server/legistar';
import { summarizeLegislation } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rawLegislation = await getRecentLegislation(50);

	// Try AI summaries with a 10s timeout — if cache is warm this is instant,
	// if cold we show raw data and the next visit will have summaries cached
	let legislation;
	try {
		legislation = await Promise.race([
			summarizeLegislation(rawLegislation),
			new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
		]);
	} catch {
		// Timed out or failed — return raw data without AI
		legislation = null;
	}

	if (!legislation) {
		legislation = rawLegislation.map(m => ({
			id: m.MatterId,
			fileNumber: m.MatterFile,
			title: m.MatterTitle || m.MatterName,
			summary: '',
			tension: '',
			status: m.MatterStatusName,
			statusExplained: m.MatterStatusName,
			type: m.MatterTypeName,
			introDate: m.MatterIntroDate,
			sponsors: m.MatterBodyName,
			topics: ['Other'] as string[],
			interestLevel: 'normal' as const,
			controversyScore: 0,
			legistarUrl: `https://nashville.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}`
		}));
	}

	return { legislation };
};
