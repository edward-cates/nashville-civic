import { getRecentLegislation } from '$lib/server/legistar';
import { getRecentStateBills } from '$lib/server/openstates';
import { summarizeLegislation, summarizeStateBills } from '$lib/server/narrative';
import type { NarrativeLegislation } from '$lib/server/narrative';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch metro and state bills in parallel
	const [rawMetro, rawState] = await Promise.all([
		getRecentLegislation(30),
		getRecentStateBills(20).catch(() => [])
	]);

	// Try AI summaries with 10s timeout each — graceful fallback
	const [metro, state] = await Promise.all([
		Promise.race([
			summarizeLegislation(rawMetro),
			new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
		]).catch(() => null),
		Promise.race([
			summarizeStateBills(rawState),
			new Promise<null>((_, reject) => setTimeout(() => reject('timeout'), 10000))
		]).catch(() => null)
	]);

	let legislation: NarrativeLegislation[] = [];

	// Metro bills — AI or raw fallback
	if (metro) {
		legislation.push(...metro);
	} else {
		legislation.push(...rawMetro.map(m => ({
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
			topics: ['Other'] as any[],
			interestLevel: 'normal' as const,
			controversyScore: 0,
			sourceUrl: `https://nashville.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}`,
			level: 'local' as const
		})));
	}

	// State bills — AI or raw fallback
	if (state) {
		legislation.push(...state);
	} else {
		legislation.push(...rawState.map(b => {
			const sponsors = (b.sponsorships || []).filter(s => s.classification === 'primary').map(s => s.name).join(', ');
			return {
				id: b.id,
				fileNumber: b.identifier,
				title: b.title,
				summary: '',
				tension: '',
				status: b.latest_action_description || 'Unknown',
				statusExplained: b.latest_action_description || '',
				type: b.classification[0] || 'bill',
				introDate: b.latest_action_date || '',
				sponsors: sponsors || 'Unknown',
				topics: ['Other'] as any[],
				interestLevel: 'normal' as const,
				controversyScore: 0,
				sourceUrl: b.openstates_url,
				level: 'state' as const
			};
		}));
	}

	return { legislation };
};
