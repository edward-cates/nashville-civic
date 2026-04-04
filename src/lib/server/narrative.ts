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
- When there's a disagreement, state BOTH sides neutrally in one sentence each. "Supporters say X. Opponents say Y."
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
	id: number;
	fileNumber: string;
	title: string;
	summary: string;
	tension: string; // "Supporters say X. Opponents say Y." or empty if no real debate
	status: string;
	statusExplained: string;
	type: string;
	introDate: string;
	sponsors: string;
	topics: Topic[];
	interestLevel: 'high' | 'normal';
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
	tension: string; // both sides, or empty if routine
	topic: Topic;
	interestLevel: 'high' | 'normal';
}

// --- Legislation ---

export async function summarizeLegislation(matters: Array<{
	MatterId: number;
	MatterFile: string;
	MatterName: string;
	MatterTitle: string;
	MatterTypeName: string;
	MatterStatusName: string;
	MatterIntroDate: string;
	MatterBodyName: string;
}>): Promise<NarrativeLegislation[]> {
	if (!matters.length) return [];

	const itemsList = matters.map((m, i) =>
		`${i + 1}. [${m.MatterFile}] "${m.MatterTitle || m.MatterName}" — Type: ${m.MatterTypeName}, Status: ${m.MatterStatusName}`
	).join('\n');

	const key = cacheKey('leg', itemsList);
	const cached = getCached(key);
	let results: Array<{
		index: number; summary: string; tension: string;
		statusExplained: string; topics: string[]; interestLevel: string;
	}> = [];

	if (cached) {
		results = JSON.parse(cached);
	} else {
		const prompt = `Classify and summarize these Nashville Metro Council items.

For each item return JSON with:
- "summary": 1-2 sentences. What is this and why should someone care? Be concrete.
- "tension": If there's a real debate, one sentence for each side: "Supporters say [X]. Opponents say [Y]." If it's routine/ceremonial, leave empty string.
- "statusExplained": 1 sentence explaining what the current status means in plain language.
- "topics": 1-2 from: ${TOPICS.join(', ')}, Other
- "interestLevel": "high" if contentious, big money, affects many people, or divisive. "normal" if routine.

Items:
${itemsList}

Respond as JSON array: [{"index": 1, "summary": "...", "tension": "...", "statusExplained": "...", "topics": [...], "interestLevel": "high|normal"}, ...]`;

		const text = await callClaude(prompt);
		results = extractJson(text) || [];
		if (results.length) setCache(key, JSON.stringify(results));
	}

	return matters.map((m, i) => {
		const ai = results.find(s => s.index === i + 1);
		return {
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
			interestLevel: (ai?.interestLevel === 'high' ? 'high' : 'normal') as 'high' | 'normal'
		};
	});
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
		issues: Array<{ title: string; summary: string; tension: string; topic: string; interestLevel: string }>;
	}> = [];

	if (cached) {
		results = JSON.parse(cached);
	} else {
		const prompt = `These are upcoming Nashville Metro Council meetings with their agenda items.

For each meeting, return:
- "summary": 1-2 sentences. What is this body and what's the most important thing they're dealing with?
- "issues": Array of the 2-4 most interesting/impactful agenda items. For each:
  - "title": Short plain-language title (not the bill number)
  - "summary": 1 sentence on what it is
  - "tension": If there's a debate, "Supporters say [X]. Opponents say [Y]." Empty string if routine.
  - "topic": One of: ${TOPICS.join(', ')}, Other
  - "interestLevel": "high" or "normal"

Skip purely procedural items (approving minutes, roll call). Focus on things people would actually disagree about or that affect their lives.

${meetingDescriptions}

Respond as JSON array: [{"index": 1, "summary": "...", "issues": [...]}, ...]`;

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
				interestLevel: (issue.interestLevel === 'high' ? 'high' : 'normal') as 'high' | 'normal'
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

// --- Weekly digest ---

export async function generateWeeklyDigest(
	meetings: NarrativeMeeting[],
	legislation: NarrativeLegislation[]
): Promise<string> {
	const highInterest = legislation.filter(l => l.interestLevel === 'high');
	const topicGroups = new Map<string, number>();
	for (const l of legislation) {
		for (const t of l.topics) {
			topicGroups.set(t, (topicGroups.get(t) || 0) + 1);
		}
	}

	const meetingSummaries = meetings.slice(0, 4).map(m => {
		const issueList = m.issues.filter(i => i.interestLevel === 'high').map(i => i.title).join(', ');
		return `- ${m.body} (${m.date}): ${m.summary}${issueList ? ` Hot issues: ${issueList}` : ''}`;
	}).join('\n');

	const prompt = `Write a "This Week in Nashville" digest in 200 words or less.

Meetings this week:
${meetingSummaries}

${highInterest.length ? `High-interest legislation:\n${highInterest.map(l => `- ${l.summary}${l.tension ? ` ${l.tension}` : ''}`).join('\n')}` : ''}

Active topics: ${[...topicGroups.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} (${n})`).join(', ')}

Lead with the most contentious or impactful thing happening. Use **bold** for emphasis. Be the friend who makes local politics interesting in under a minute of reading.`;

	const key = cacheKey('digest', meetingSummaries);
	const cached = getCached(key);
	if (cached) return cached;

	const text = await callClaude(prompt, 2048);
	if (text) setCache(key, text);
	return text;
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
