import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

const CACHE = new Map<string, { text: string; expires: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const SYSTEM_PROMPT = `You are writing for Nashville Civic, a local politics website. Your job is to explain Nashville government activity in plain language that a 15-year-old would understand.

Rules:
- Short sentences. Active voice.
- No government jargon without explanation. "Ordinance" = "a new rule the council is voting on." "Resolution" = "a formal statement."
- Lead with why someone should care, then give the details.
- Never state opinions. Never say something is good or bad.
- Never recommend how to vote or who to support.
- If you don't know something, say so. Don't make things up.
- Be specific: use names, places, dollar amounts, dates.
- Be conversational. "Your council member voted yes" not "The representative cast an affirmative vote."
- Explain procedural steps simply: "Bills need three votes to become law" not "pursuant to the Metro Charter, legislation requires passage on three readings."`;

function getClient(): Anthropic | null {
	const apiKey = env.ANTHROPIC_API_KEY;
	if (!apiKey) return null;
	return new Anthropic({ apiKey });
}

function cacheKey(prefix: string, data: string): string {
	// Simple hash for cache key
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

async function generate(prompt: string, cachePrefix: string): Promise<string> {
	const key = cacheKey(cachePrefix, prompt);
	const cached = getCached(key);
	if (cached) return cached;

	const client = getClient();
	if (!client) return '';

	try {
		const response = await client.messages.create({
			model: 'claude-haiku-4-5-20251001',
			max_tokens: 1024,
			system: SYSTEM_PROMPT,
			messages: [{ role: 'user', content: prompt }]
		});

		const text = response.content[0].type === 'text' ? response.content[0].text : '';
		setCache(key, text);
		return text;
	} catch (err) {
		console.error('Claude API error:', err);
		return '';
	}
}

// --- Topics ---

export const TOPICS = [
	'Housing & Development',
	'Transit & Transportation',
	'Public Safety & Policing',
	'Budget & Taxes',
	'Education & Schools',
	'Parks & Public Spaces',
	'Business & Permits',
	'Civil Rights & Equity',
	'Environment',
	'Infrastructure',
	'Government Operations',
	'Other'
] as const;

export type Topic = typeof TOPICS[number];

// --- Public functions ---

export interface NarrativeLegislation {
	id: number;
	fileNumber: string;
	title: string;
	summary: string;
	status: string;
	statusExplained: string;
	type: string;
	introDate: string;
	sponsors: string;
	topics: Topic[];
	interestLevel: 'high' | 'normal'; // high = contentious, impactful, or divisive
}

export interface NarrativeMeeting {
	id: number;
	body: string;
	date: string;
	time: string;
	location: string;
	summary: string; // AI-generated "what matters" summary
	agendaUrl?: string;
	videoUrl?: string;
}

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

	const client = getClient();

	// Build batch prompt for efficiency
	const itemsList = matters.map((m, i) =>
		`${i + 1}. [${m.MatterFile}] "${m.MatterTitle || m.MatterName}" — Type: ${m.MatterTypeName}, Status: ${m.MatterStatusName}`
	).join('\n');

	const prompt = `Here are recent items from the Nashville Metro Council. For each one, write:
1. A plain-language summary (1-2 sentences explaining what this is about and why someone might care)
2. A plain-language status explanation (1 sentence explaining what the current status means)
3. 1-2 topic tags from this list: ${TOPICS.join(', ')}
4. An interest level: "high" if this is likely contentious, impacts many people, involves significant money, or touches on divisive issues (policing, housing, civil rights, big budget items). "normal" for routine items (honorary street names, minor permits, procedural stuff).

Items:
${itemsList}

Respond in JSON format as an array:
[{"index": 1, "summary": "...", "statusExplained": "...", "topics": ["Housing & Development"], "interestLevel": "high"}, ...]

Keep each summary under 100 words. If a title is too vague to summarize meaningfully, say what type of action it is in simple terms.`;

	let summaries: Array<{ index: number; summary: string; statusExplained: string; topics?: string[]; interestLevel?: string }> = [];

	if (client) {
		const key = cacheKey('legislation', itemsList);
		const cached = getCached(key);

		if (cached) {
			try { summaries = JSON.parse(cached); } catch { /* use empty */ }
		} else {
			try {
				const response = await client.messages.create({
					model: 'claude-haiku-4-5-20251001',
					max_tokens: 4096,
					system: SYSTEM_PROMPT,
					messages: [{ role: 'user', content: prompt }]
				});

				const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
				// Extract JSON from response (might be wrapped in markdown code block)
				const jsonMatch = text.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					summaries = JSON.parse(jsonMatch[0]);
					setCache(key, JSON.stringify(summaries));
				}
			} catch (err) {
				console.error('Claude legislation summary error:', err);
			}
		}
	}

	return matters.map((m, i) => {
		const ai = summaries.find(s => s.index === i + 1);
		return {
			id: m.MatterId,
			fileNumber: m.MatterFile,
			title: m.MatterTitle || m.MatterName,
			summary: ai?.summary || '',
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

export async function summarizeMeetings(events: Array<{
	EventId: number;
	EventBodyName: string;
	EventDate: string;
	EventTime: string;
	EventLocation: string;
	EventAgendaFile: string;
	EventVideoPath: string;
	EventInSiteURL: string;
}>): Promise<NarrativeMeeting[]> {
	if (!events.length) return [];

	const client = getClient();
	const results: NarrativeMeeting[] = [];

	// For meetings, we generate a summary of what each body does (not agenda-specific yet)
	const bodyNames = [...new Set(events.map(e => e.EventBodyName))];
	const prompt = `These are Nashville Metro Council bodies that have meetings coming up:
${bodyNames.map((b, i) => `${i + 1}. ${b}`).join('\n')}

For each one, write a brief (1-2 sentence) explanation of what this body does and why a Nashville resident might care about their meetings. Respond in JSON format:
[{"index": 1, "summary": "..."}, ...]`;

	let bodySummaries: Array<{ index: number; summary: string }> = [];

	if (client) {
		const key = cacheKey('meetings', bodyNames.join(','));
		const cached = getCached(key);

		if (cached) {
			try { bodySummaries = JSON.parse(cached); } catch { /* use empty */ }
		} else {
			try {
				const response = await client.messages.create({
					model: 'claude-haiku-4-5-20251001',
					max_tokens: 2048,
					system: SYSTEM_PROMPT,
					messages: [{ role: 'user', content: prompt }]
				});
				const text = response.content[0].type === 'text' ? response.content[0].text : '[]';
				const jsonMatch = text.match(/\[[\s\S]*\]/);
				if (jsonMatch) {
					bodySummaries = JSON.parse(jsonMatch[0]);
					setCache(key, JSON.stringify(bodySummaries));
				}
			} catch (err) {
				console.error('Claude meeting summary error:', err);
			}
		}
	}

	for (const event of events) {
		const bodyIndex = bodyNames.indexOf(event.EventBodyName);
		const ai = bodySummaries.find(s => s.index === bodyIndex + 1);

		results.push({
			id: event.EventId,
			body: event.EventBodyName,
			date: event.EventDate,
			time: event.EventTime,
			location: event.EventLocation,
			summary: ai?.summary || '',
			agendaUrl: event.EventAgendaFile || undefined,
			videoUrl: event.EventVideoPath || event.EventInSiteURL || undefined
		});
	}

	return results;
}

export async function summarizeRepActivity(
	repName: string,
	office: string,
	recentMatters: Array<{ MatterFile: string; MatterTitle: string; MatterTypeName: string; MatterStatusName: string }>,
	committees: string[]
): Promise<string> {
	if (!recentMatters.length && !committees.length) return '';

	const prompt = `Write a brief (3-5 sentence) narrative about what Nashville Metro Council member ${repName} (${office}) has been up to recently.

${committees.length ? `They sit on these committees: ${committees.join(', ')}` : ''}

${recentMatters.length ? `Recent legislation they've been involved with:
${recentMatters.map(m => `- [${m.MatterFile}] "${m.MatterTitle}" (${m.MatterTypeName}, ${m.MatterStatusName})`).join('\n')}` : ''}

Write it as a conversational summary — what are they focused on? What have they done lately? Explain committee roles in terms of what they actually control.`;

	return generate(prompt, 'rep-activity');
}

export async function generateWeeklyDigest(
	meetings: Array<{ EventBodyName: string; EventDate: string; EventTime: string }>,
	legislation: Array<{ MatterFile: string; MatterTitle: string; MatterTypeName: string; MatterStatusName: string }>
): Promise<string> {
	const prompt = `Write a "This Week in Nashville Politics" digest. Keep it conversational and engaging — like a friend telling you what's happening at city hall this week.

Upcoming meetings this week:
${meetings.map(m => `- ${m.EventBodyName} on ${m.EventDate} at ${m.EventTime}`).join('\n')}

Recent legislation activity:
${legislation.map(m => `- [${m.MatterFile}] "${m.MatterTitle}" — ${m.MatterTypeName}, ${m.MatterStatusName}`).join('\n')}

Structure it as:
1. Lead with the most interesting/impactful thing happening this week (2-3 sentences)
2. Other notable meetings coming up (brief)
3. Bills to watch (the most interesting/impactful ones)

Keep the whole thing under 300 words. Make someone who doesn't care about politics think "huh, that's actually interesting."`;

	return generate(prompt, 'weekly-digest');
}

export async function explainStatus(status: string): Promise<string> {
	const commonStatuses: Record<string, string> = {
		'Introduced': 'This was just proposed. It hasn\'t been voted on yet.',
		'Passed on First Reading': 'It passed its first vote. Bills need three votes to become law in Nashville. Two more to go.',
		'Referred': 'It got sent to a committee for review. The committee will study it and decide whether to recommend it to the full council.',
		'Passed on Second Reading': 'It passed its second vote. One more vote and it becomes law.',
		'Passed on Third Reading': 'It passed all three votes. It\'s now heading to the mayor\'s desk to be signed into law.',
		'Approved': 'It\'s done. The mayor signed it and it\'s now law.',
		'Filed': 'It was officially submitted but hasn\'t been acted on yet.',
		'Withdrawn': 'The person who proposed it pulled it back. It\'s off the table.',
		'Deferred': 'They decided to wait and deal with it later.',
		'Substituted': 'The original version was replaced with a new version.',
		'Amended': 'They changed some parts of it before voting.',
		'Failed': 'It was voted down. It didn\'t pass.'
	};

	return commonStatuses[status] || `Current status: ${status}`;
}
