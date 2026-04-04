import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

const CACHE = new Map<string, { text: string; expires: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const SYSTEM_PROMPT = `You are writing for Nashville Civic, a local politics site. Explain Nashville government activity so a 15-year-old gets it.

Rules:
- Short sentences. Active voice. No filler.
- No jargon without explanation.
- Lead with why someone should care.
- Never state opinions or recommend how to vote.
- Be specific: names, places, dollar amounts.
- ALWAYS explain both sides of any debate. Even when one side seems obviously right, present both perspectives fairly. Most people on both sides have a point — help readers see that.
- For routine/operational items with no real debate, say so explicitly: "This is standard city business — no controversy here" or "This is a procedural vote, not a policy debate."
- Conversational tone. Not formal.
- Be concise. Every word must earn its place.`;

function getClient(): Anthropic | null {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) return null;
	return new Anthropic({ apiKey });
}

function cacheKey(prefix: string, data: string): string {
	let hash = 0;
	for (let i = 0; i < data.length; i++) {
		const char = data.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0;
	}
	return `${prefix}:${hash}`;
}

function getCached(key: string): string | null {
	const entry = CACHE.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expires) {
		CACHE.delete(key);
		return null;
	}
	return entry.text;
}

function setCache(key: string, text: string): void {
	CACHE.set(key, { text, expires: Date.now() + CACHE_TTL });
}

async function callClaude(prompt: string, maxTokens = 4096): Promise<string> {
	const client = getClient();
	if (!client) return '';
	try {
		const response = await client.messages.create({
			model: 'claude-haiku-4-5-20251001',
			max_tokens: maxTokens,
			system: SYSTEM_PROMPT,
			messages: [{ role: 'user', content: prompt }]
		});
		return response.content[0].type === 'text' ? response.content[0].text : '';
	} catch (err) {
		console.error('Claude API error:', err);
		return '';
	}
}

function extractJson<T>(text: string): T | null {
	const match = text.match(/\[[\s\S]*\]/);
	if (!match) return null;
	try { return JSON.parse(match[0]); } catch { return null; }
}

// --- Topics ---

export const TOPICS = [
	'Housing & Development',
	'Transit & Transportation',
	'Public Safety',
	'Budget & Taxes',
	'Education',
	'Parks & Public Spaces',
	'Business & Permits',
	'Civil Rights & Equity',
	'Environment',
	'Infrastructure',
	'Government Operations'
] as const;

export type Topic = typeof TOPICS[number] | 'Other';

// --- Public types ---

export interface NarrativeLegislation {
	id: number | string;
	fileNumber: string;
	title: string;
	summary: string;
	tension: string;
	status: string;
	statusExplained: string;
	type: string;
	introDate: string;
	sponsors: string;
	topics: Topic[];
	interestLevel: 'high' | 'normal';
	controversyScore: number; // 1-10
	sourceUrl: string;
	level: 'local' | 'state'; // metro council vs TN state legislature
}

export interface NarrativeMeeting {
	id: number;
	body: string;
	date: string;
	time: string;
	location: string;
	summary: string;
	issues: NarrativeMeetingIssue[];
	agendaUrl?: string;
	videoUrl?: string;
}

export interface NarrativeMeetingIssue {
	title: string;
	summary: string;
	tension: string; // ALWAYS filled: either both sides of a debate, or "Routine — no real debate here."
	topic: Topic;
	interestLevel: 'high' | 'normal';
	controversyScore: number; // 1-10
}

// --- Legislation ---

type MatterInput = {
	MatterId: number;
	MatterFile: string;
	MatterName: string;
	MatterTitle: string;
	MatterTypeName: string;
	MatterStatusName: string;
	MatterIntroDate: string;
	MatterBodyName: string;
};

type AiResult = {
	index: number; summary: string; tension: string;
	statusExplained: string; topics: string[]; interestLevel: string;
	controversyScore?: number;
};

const BATCH_SIZE = 10;

async function summarizeBatch(batch: MatterInput[], batchOffset: number): Promise<AiResult[]> {
	const itemsList = batch.map((m, i) =>
		`${i + 1}. [${m.MatterFile}] "${m.MatterTitle || m.MatterName}" — Type: ${m.MatterTypeName}, Status: ${m.MatterStatusName}`
	).join('\n');

	const key = cacheKey('leg', itemsList);
	const cached = getCached(key);
	if (cached) {
		try { return JSON.parse(cached); } catch { /* fall through */ }
	}

	const prompt = `Classify and summarize these Nashville Metro Council items.

For each item return JSON with:
- "summary": 1-2 sentences. What is this and why should someone care? Be concrete.
- "tension": ALWAYS fill this in. For debatable items: "Supporters say [specific argument]. Opponents say [specific argument]." Both sides usually have a point — help people see that. For routine/ceremonial items: "Routine city business — no real controversy here." or "This is procedural, not a policy debate." NEVER leave empty.
- "statusExplained": 1 sentence explaining what the current status means in plain language.
- "topics": 1-2 from: ${TOPICS.join(', ')}, Other
- "interestLevel": "high" if contentious, big money, affects many people, or divisive. "normal" if routine.
- "controversyScore": 1-10 integer. 1 = completely routine/ceremonial (naming a street, approving minutes). 5 = moderate debate (reasonable people disagree). 8-10 = deeply divisive (policing, housing equity, big tax/budget fights, civil rights). Be honest — most items are 1-3.

Items:
${itemsList}

Respond as JSON array: [{"index": 1, "summary": "...", "tension": "...", "statusExplained": "...", "topics": [...], "interestLevel": "high|normal", "controversyScore": 5}, ...]`;

	const text = await callClaude(prompt);
	const results = extractJson<AiResult[]>(text) || [];
	if (results.length) setCache(key, JSON.stringify(results));
	return results;
}

export async function summarizeLegislation(matters: MatterInput[]): Promise<NarrativeLegislation[]> {
	if (!matters.length) return [];

	// Split into batches and process in parallel
	const batches: MatterInput[][] = [];
	for (let i = 0; i < matters.length; i += BATCH_SIZE) {
		batches.push(matters.slice(i, i + BATCH_SIZE));
	}

	const batchResults = await Promise.all(
		batches.map((batch, i) => summarizeBatch(batch, i * BATCH_SIZE).catch(() => [] as AiResult[]))
	);

	// Flatten results
	const allResults: AiResult[] = [];
	for (const results of batchResults) {
		allResults.push(...results);
	}

	// Map batched results back to NarrativeLegislation
	const mapped: NarrativeLegislation[] = [];
	for (let b = 0; b < batches.length; b++) {
		const batch = batches[b];
		const results = batchResults[b] || [];
		for (let i = 0; i < batch.length; i++) {
			const m = batch[i];
			const ai = results.find(s => s.index === i + 1);
			mapped.push({
				id: m.MatterId,
				fileNumber: m.MatterFile,
				title: m.MatterTitle || m.MatterName,
				summary: ai?.summary || '',
				tension: ai?.tension || '',
				status: m.MatterStatusName,
				statusExplained: ai?.statusExplained || m.MatterStatusName,
				type: m.MatterTypeName,
				introDate: m.MatterIntroDate,
				sponsors: m.MatterBodyName,
				topics: (ai?.topics || ['Other']) as Topic[],
				interestLevel: (ai?.interestLevel === 'high' ? 'high' : 'normal') as 'high' | 'normal',
				controversyScore: Math.max(1, Math.min(10, ai?.controversyScore || 1)),
				sourceUrl: `https://nashville.legistar.com/LegislationDetail.aspx?ID=${m.MatterId}`,
				level: 'local'
			});
		}
	}

	return mapped;
}

// --- State bills ---

export interface StateBillInput {
	id: string;
	identifier: string;
	title: string;
	classification: string[];
	subject: string[];
	openstates_url: string;
	latest_action_description?: string;
	latest_action_date?: string;
	sponsorships?: Array<{ name: string; classification: string }>;
	abstracts?: Array<{ abstract: string }>;
}

async function summarizeStateBatch(batch: StateBillInput[]): Promise<AiResult[]> {
	const itemsList = batch.map((b, i) => {
		const sponsors = (b.sponsorships || []).filter(s => s.classification === 'primary').map(s => s.name).join(', ');
		const abstract = b.abstracts?.[0]?.abstract || '';
		return `${i + 1}. [${b.identifier}] "${b.title}" — Subjects: ${b.subject.join(', ') || 'none'}, Status: ${b.latest_action_description || 'unknown'}${sponsors ? `, Sponsor: ${sponsors}` : ''}${abstract ? `\n   Summary: ${abstract}` : ''}`;
	}).join('\n');

	const key = cacheKey('stleg', itemsList);
	const cached = getCached(key);
	if (cached) {
		try { return JSON.parse(cached); } catch { /* fall through */ }
	}

	const prompt = `Classify and summarize these Tennessee state legislature bills. These affect Nashville because Nashville is in Tennessee — state laws override local ones.

For each item return JSON with:
- "summary": 1-2 sentences. What is this and why should a Nashville resident care? Be concrete. This is STATE legislation, not city council.
- "tension": ALWAYS fill this in. For debatable items: "Supporters say [specific argument]. Opponents say [specific argument]." Nashville is a blue city in a red state — many state bills directly conflict with what Nashville voters want. Be honest about that tension without taking sides. For routine items: "Routine state business — no real controversy here." NEVER leave empty.
- "statusExplained": 1 sentence explaining what the current status means.
- "topics": 1-2 from: ${TOPICS.join(', ')}, Other
- "interestLevel": "high" if contentious, big money, affects many people, or divisive. "normal" if routine.
- "controversyScore": 1-10 integer. 1 = routine. 5 = moderate. 8-10 = deeply divisive. State preemption of Nashville policies = high controversy.

Items:
${itemsList}

Respond as JSON array: [{"index": 1, "summary": "...", "tension": "...", "statusExplained": "...", "topics": [...], "interestLevel": "high|normal", "controversyScore": 5}, ...]`;

	const text = await callClaude(prompt);
	const results = extractJson<AiResult[]>(text) || [];
	if (results.length) setCache(key, JSON.stringify(results));
	return results;
}

export async function summarizeStateBills(bills: StateBillInput[]): Promise<NarrativeLegislation[]> {
	if (!bills.length) return [];

	const batches: StateBillInput[][] = [];
	for (let i = 0; i < bills.length; i += BATCH_SIZE) {
		batches.push(bills.slice(i, i + BATCH_SIZE));
	}

	const batchResults = await Promise.all(
		batches.map(batch => summarizeStateBatch(batch).catch(() => [] as AiResult[]))
	);

	const mapped: NarrativeLegislation[] = [];
	for (let b = 0; b < batches.length; b++) {
		const batch = batches[b];
		const results = batchResults[b] || [];
		for (let i = 0; i < batch.length; i++) {
			const bill = batch[i];
			const ai = results.find(s => s.index === i + 1);
			const sponsors = (bill.sponsorships || []).filter(s => s.classification === 'primary').map(s => s.name).join(', ');
			mapped.push({
				id: bill.id,
				fileNumber: bill.identifier,
				title: bill.title,
				summary: ai?.summary || '',
				tension: ai?.tension || '',
				status: bill.latest_action_description || 'Unknown',
				statusExplained: ai?.statusExplained || bill.latest_action_description || '',
				type: bill.classification[0] || 'bill',
				introDate: bill.latest_action_date || '',
				sponsors: sponsors || 'Unknown',
				topics: (ai?.topics || ['Other']) as Topic[],
				interestLevel: (ai?.interestLevel === 'high' ? 'high' : 'normal') as 'high' | 'normal',
				controversyScore: Math.max(1, Math.min(10, ai?.controversyScore || 1)),
				sourceUrl: bill.openstates_url,
				level: 'state'
			});
		}
	}

	return mapped;
}

// --- Meetings with agenda issues ---

export async function summarizeMeetingsWithAgenda(
	events: Array<{
		EventId: number;
		EventBodyName: string;
		EventDate: string;
		EventTime: string;
		EventLocation: string;
		EventAgendaFile: string;
		EventVideoPath: string;
		EventInSiteURL: string;
	}>,
	agendaItemsByEvent: Map<number, Array<{
		EventItemMatterFile: string;
		EventItemMatterName: string;
		EventItemMatterType: string;
		EventItemMatterStatus: string;
	}>>
): Promise<NarrativeMeeting[]> {
	if (!events.length) return [];

	// Build a combined prompt for all meetings with their agenda items
	const meetingDescriptions = events.map((e, i) => {
		const items = agendaItemsByEvent.get(e.EventId) || [];
		const itemList = items.length
			? items.map(item => `  - [${item.EventItemMatterFile}] "${item.EventItemMatterName}" (${item.EventItemMatterType}, ${item.EventItemMatterStatus})`).join('\n')
			: '  (no agenda items available)';
		return `Meeting ${i + 1}: ${e.EventBodyName} on ${e.EventDate} at ${e.EventTime}\nAgenda items:\n${itemList}`;
	}).join('\n\n');

	const key = cacheKey('mtg', meetingDescriptions);
	const cached = getCached(key);
	let results: Array<{
		index: number; summary: string;
		issues: Array<{ title: string; summary: string; tension: string; topic: string; interestLevel: string; controversyScore?: number }>;
	}> = [];

	if (cached) {
		results = JSON.parse(cached);
	} else {
		const prompt = `These are upcoming Nashville Metro Council meetings with their agenda items.

For each meeting, return:
- "summary": 1-2 sentences. What is this body and what's the most important thing they're dealing with? If it's a routine meeting with nothing controversial, say so: "Mostly routine business this time."
- "issues": Array of the 2-4 most interesting/impactful agenda items. For each:
  - "title": Short plain-language title (not the bill number)
  - "summary": 1 sentence on what it is
  - "tension": ALWAYS fill this in. For debatable items: "Supporters say [specific argument]. Opponents say [specific argument]." Present both sides fairly — usually both have a point. For routine items: "Standard city business — not expected to be controversial." NEVER leave empty.
  - "topic": One of: ${TOPICS.join(', ')}, Other
  - "interestLevel": "high" or "normal"
  - "controversyScore": 1-10 integer. 1 = routine. 5 = moderate debate. 8-10 = deeply divisive.

Skip purely procedural items (approving minutes, roll call). Focus on things people would actually disagree about or that affect their lives. If a meeting is entirely routine, still include 1-2 items but mark them as normal interest.

${meetingDescriptions}

Respond as JSON array: [{"index": 1, "summary": "...", "issues": [{"title":"...", "summary":"...", "tension":"...", "topic":"...", "interestLevel":"...", "controversyScore": 5}]}, ...]`;

		const text = await callClaude(prompt);
		results = extractJson(text) || [];
		if (results.length) setCache(key, JSON.stringify(results));
	}

	return events.map((e, i) => {
		const ai = results.find(r => r.index === i + 1);
		return {
			id: e.EventId,
			body: e.EventBodyName,
			date: e.EventDate,
			time: e.EventTime,
			location: e.EventLocation,
			summary: ai?.summary || '',
			issues: (ai?.issues || []).map(issue => ({
				title: issue.title,
				summary: issue.summary,
				tension: issue.tension || '',
				topic: (issue.topic || 'Other') as Topic,
				interestLevel: (issue.interestLevel === 'high' ? 'high' : 'normal') as 'high' | 'normal',
				controversyScore: Math.max(1, Math.min(10, issue.controversyScore || 1))
			})),
			agendaUrl: e.EventAgendaFile || undefined,
			videoUrl: e.EventVideoPath || e.EventInSiteURL || undefined
		};
	});
}

// --- Rep activity ---

export async function summarizeRepActivity(
	repName: string,
	office: string,
	recentMatters: Array<{ MatterFile: string; MatterTitle: string; MatterTypeName: string; MatterStatusName: string }>,
	committees: string[]
): Promise<string> {
	if (!recentMatters.length && !committees.length) return '';

	const dataStr = `${repName}|${committees.join(',')}|${recentMatters.map(m => m.MatterFile).join(',')}`;
	const key = cacheKey('rep', dataStr);
	const cached = getCached(key);
	if (cached) return cached;

	const prompt = `Write 3-4 sentences about Nashville Metro Council member ${repName} (${office}).
${committees.length ? `Committees: ${committees.join(', ')}` : ''}
${recentMatters.length ? `Recent legislation:\n${recentMatters.map(m => `- "${m.MatterTitle}" (${m.MatterStatusName})`).join('\n')}` : ''}

What are they focused on? What do their committee roles mean in practice? Keep it concrete.`;

	const text = await callClaude(prompt, 1024);
	if (text) setCache(key, text);
	return text;
}

// --- Story cards for horizontal scroll strip ---

export interface StoryCard {
	headline: string;
	body: string;
	tension: string;
	topic: Topic;
	interestLevel: 'high' | 'normal';
	controversyScore: number;
	source: 'meeting' | 'legislation';
	sourceDetail: string;
	link?: string;
	linkLabel?: string;
}

export function generateStoryCards(
	meetings: NarrativeMeeting[],
	legislation: NarrativeLegislation[]
): StoryCard[] {
	const cards: StoryCard[] = [];

	// Cards from meeting issues
	for (const meeting of meetings) {
		const dateStr = new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long' });
		for (const issue of meeting.issues) {
			cards.push({
				headline: issue.title,
				body: issue.summary,
				tension: issue.tension,
				topic: issue.topic,
				interestLevel: issue.interestLevel,
				controversyScore: issue.controversyScore,
				source: 'meeting',
				sourceDetail: `${meeting.body} — ${dateStr}`,
				link: meeting.agendaUrl || '/whats-happening',
				linkLabel: meeting.agendaUrl ? 'See agenda' : 'See meeting details'
			});
		}
	}

	// Cards from legislation (skip duplicates already covered by meeting issues)
	for (const item of legislation) {
		if (item.controversyScore <= 1 && item.interestLevel === 'normal') continue;

		const isDuplicate = cards.some(c =>
			c.headline.toLowerCase().includes(item.title.toLowerCase().slice(0, 20)) ||
			item.title.toLowerCase().includes(c.headline.toLowerCase().slice(0, 20))
		);
		if (!isDuplicate) {
			cards.push({
				headline: item.summary.split('.')[0] || item.title,
				body: item.summary,
				tension: item.tension,
				topic: item.topics[0] || 'Other',
				interestLevel: item.interestLevel,
				controversyScore: item.controversyScore,
				source: 'legislation',
				sourceDetail: item.fileNumber,
				link: '/legislation',
				linkLabel: 'See all bills'
			});
		}
	}

	// Sort by controversy score, descending
	cards.sort((a, b) => b.controversyScore - a.controversyScore);

	return cards;
}

// --- Status explainer (no API call) ---

export function explainStatus(status: string): string {
	const map: Record<string, string> = {
		'Introduced': 'Just proposed. No vote yet.',
		'Passed on First Reading': 'Passed vote 1 of 3.',
		'Referred': 'Sent to committee for review.',
		'Passed on Second Reading': 'Passed vote 2 of 3. One more to go.',
		'Passed on Third Reading': 'Passed all 3 votes. Heading to the mayor.',
		'Approved': 'Signed into law.',
		'Filed': 'Submitted, not yet acted on.',
		'Withdrawn': 'Pulled back by the sponsor.',
		'Deferred': 'Postponed to a later date.',
		'Substituted': 'Replaced with a new version.',
		'Amended': 'Modified before voting.',
		'Failed': 'Voted down.'
	};
	return map[status] || status;
}
