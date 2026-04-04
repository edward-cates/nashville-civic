<script lang="ts">
	import { CalendarDays, FileText, Newspaper, ChevronDown, ChevronRight, Flame } from 'lucide-svelte';
	import StoryCarousel from '$lib/components/StoryCarousel.svelte';
	import LoadingPulse from '$lib/components/LoadingPulse.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import type { NarrativeLegislation } from '$lib/server/narrative';

	let { data } = $props();

	// Track which topic sections are expanded — default to expanded (undefined = expanded)
	let expandedTopics = $state<Record<string, boolean>>({});

	function isTopicExpanded(topic: string): boolean {
		return expandedTopics[topic] !== false;
	}

	function toggleTopic(topic: string) {
		expandedTopics[topic] = !isTopicExpanded(topic);
	}

	function groupByTopic(legislation: NarrativeLegislation[]) {
		if (!legislation || legislation.length === 0) return [];
		const groups: Record<string, NarrativeLegislation[]> = {};
		for (const item of legislation) {
			const topics = item.topics && item.topics.length > 0 ? item.topics : ['Other'];
			for (const topic of topics) {
				if (!groups[topic]) groups[topic] = [];
				groups[topic].push(item);
			}
		}
		// Sort items within each group: high-interest first
		for (const topic of Object.keys(groups)) {
			groups[topic].sort((a, b) => {
				if (a.interestLevel === 'high' && b.interestLevel !== 'high') return -1;
				if (a.interestLevel !== 'high' && b.interestLevel === 'high') return 1;
				return 0;
			});
		}
		// Sort topics: "Other" last, rest alphabetical
		const sorted = Object.entries(groups).sort(([a], [b]) => {
			if (a === 'Other') return 1;
			if (b === 'Other') return -1;
			return a.localeCompare(b);
		});
		return sorted;
	}

</script>

<svelte:head>
	<title>What's Happening in Nashville - Nashville Civic</title>
	<meta
		name="description"
		content="Your weekly digest of Nashville politics: upcoming meetings, recent legislation, and what it all means in plain language."
	/>
</svelte:head>

<!-- Header -->
<section class="bg-civic-900 text-white py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl sm:text-4xl font-bold mb-3">What's Happening in Nashville</h1>
		<p class="text-civic-200 text-lg leading-relaxed">
			Here's what's going on at Metro Council this week, explained in plain language. No jargon, no
			legalese, just what you need to know.
		</p>
	</div>
</section>

<!-- Story Carousel — streams independently -->
{#await data.storyCards}
	<section class="py-12 sm:py-16 bg-civic-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-6">
				<Newspaper class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">The Week at a Glance</h2>
			</div>
			<div class="bg-white rounded-xl shadow-sm border border-civic-100 p-6 sm:p-8">
				<LoadingPulse lines={4} label="Building story cards..." />
			</div>
		</div>
	</section>
{:then storyCards}
	{#if storyCards && storyCards.length > 0}
		<section class="py-12 sm:py-16 bg-civic-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-6">
					<Newspaper class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">The Week at a Glance</h2>
				</div>
				<StoryCarousel cards={storyCards} />
			</div>
		</section>
	{/if}
{:catch}
	<!-- silent fail for story cards -->
{/await}

<!-- Meetings — streams independently -->
{#await data.meetings}
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-6">
				<CalendarDays class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Upcoming Meetings</h2>
			</div>
			<div class="space-y-6">
				{#each Array(3) as _}
					<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
						<LoadingPulse lines={5} label="Analyzing agendas..." />
					</div>
				{/each}
			</div>
		</div>
	</section>
{:then meetings}
	{#if meetings && meetings.length > 0}
		<section class="py-12 sm:py-16">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-4">
					<CalendarDays class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Upcoming Meetings</h2>
				</div>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">
					These are meetings where Nashville's government does its work. Most are open to the public,
					and many let you speak during public comment.
				</p>
				<div class="space-y-8">
					{#each meetings as meeting}
						<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
							<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
								<h3 class="text-xl font-semibold text-civic-800">{meeting.body}</h3>
								<time class="text-sm text-gray-500">
									{new Date(meeting.date).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric'
									})} at {meeting.time}
								</time>
							</div>
							{#if meeting.location}
								<p class="text-sm text-gray-500 mb-3">{meeting.location}</p>
							{/if}
							{#if meeting.summary}
								<div class="text-gray-700 leading-relaxed mb-4 prose prose-sm max-w-none">{@html renderMarkdown(meeting.summary)}</div>
							{/if}

							<!-- Meeting Issues — Full Detail -->
							{#if meeting.issues && meeting.issues.length > 0}
								<div class="space-y-4 mb-5">
									<h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Key Issues on the Agenda</h4>
									{#each meeting.issues as issue}
										<div class="pl-4 border-l-3 {issue.interestLevel === 'high' ? 'border-amber-500 bg-amber-50/40' : 'border-gray-200'} rounded-r-lg py-2 pr-3">
											<div class="flex items-center gap-2 mb-1">
												{#if issue.interestLevel === 'high'}
													<Flame class="h-4 w-4 text-amber-500 shrink-0" />
												{/if}
												<p class="font-semibold text-gray-800">{issue.title}</p>
											</div>
											<p class="text-sm text-gray-600 leading-relaxed">{issue.summary}</p>
											{#if issue.tension}
												<p class="text-sm italic text-gray-500 mt-1.5 leading-relaxed">{issue.tension}</p>
											{/if}
											{#if issue.topic}
												<span class="inline-block mt-1.5 text-xs bg-civic-50 text-civic-600 rounded px-1.5 py-0.5">{issue.topic}</span>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							<div class="flex flex-wrap gap-4 text-sm pt-3 border-t border-gray-100">
								{#if meeting.agendaUrl}
									<a
										href={meeting.agendaUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2"
									>
										View full agenda
									</a>
								{/if}
								{#if meeting.videoUrl}
									<a
										href={meeting.videoUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2"
									>
										Watch video
									</a>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/if}
{:catch}
	<section class="py-16 sm:py-24">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<p class="text-gray-600 text-lg mb-4">
				Something went wrong loading meeting data.
			</p>
			<a
				href="/legislation"
				class="inline-block px-6 py-3 bg-civic-700 text-white rounded-lg hover:bg-civic-800 transition-colors font-medium"
			>
				Browse all legislation
			</a>
		</div>
	</section>
{/await}

<!-- All Legislation by Topic — streams independently -->
{#await data.legislation}
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-6">
				<FileText class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">All Legislation by Topic</h2>
			</div>
			<div class="space-y-3">
				{#each Array(4) as _}
					<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
						<LoadingPulse lines={2} label="Translating legislation into plain English..." />
					</div>
				{/each}
			</div>
		</div>
	</section>
{:then legislation}
	{@const topicGroups = groupByTopic(legislation)}
	{#if topicGroups.length > 0}
		<section class="py-12 sm:py-16 bg-gray-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-4">
					<FileText class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">All Legislation by Topic</h2>
				</div>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">
					Every bill, ordinance, and resolution Metro Council is working on, translated from
					government-speak into plain English and grouped by topic.
				</p>
				<div class="space-y-4">
					{#each topicGroups as [topic, items]}
						<div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
							<button
								onclick={() => toggleTopic(topic)}
								class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
							>
								<span class="flex items-center gap-2">
									<span class="text-lg font-semibold text-civic-800">{topic}</span>
									<span class="text-xs bg-civic-100 text-civic-700 rounded-full px-2.5 py-0.5 font-medium">{items.length}</span>
									{#if items.some(i => i.interestLevel === 'high')}
										<Flame class="h-4 w-4 text-amber-500" />
									{/if}
								</span>
								{#if isTopicExpanded(topic)}
									<ChevronDown class="h-5 w-5 text-gray-400" />
								{:else}
									<ChevronRight class="h-5 w-5 text-gray-400" />
								{/if}
							</button>
							{#if isTopicExpanded(topic)}
								<div class="border-t border-gray-100 divide-y divide-gray-50">
									{#each items as item}
										<div class="px-5 py-4 {item.interestLevel === 'high' ? 'border-l-3 border-l-amber-500' : ''}">
											<div class="flex items-start gap-2 mb-1">
												{#if item.interestLevel === 'high'}
													<Flame class="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
												{/if}
												<div class="flex-1 min-w-0">
													<div class="text-gray-800 leading-relaxed prose prose-sm max-w-none">{@html renderMarkdown(item.summary)}</div>
													{#if item.tension}
														<p class="text-sm italic text-gray-500 mt-1.5 leading-relaxed">{item.tension}</p>
													{/if}
													{#if item.statusExplained}
														<div class="text-sm text-civic-700 mt-1.5 prose prose-sm max-w-none">{@html renderMarkdown(item.statusExplained)}</div>
													{:else if item.status}
														<p class="text-sm text-gray-600 mt-1">Status: {item.status}</p>
													{/if}
													<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
														<span class="font-medium">{item.fileNumber}</span>
														{#if item.type}
															<span class="inline-block px-1.5 py-0.5 bg-civic-50 text-civic-600 rounded font-medium">{item.type}</span>
														{/if}
														{#if item.sponsors}
															<span>Sponsors: {item.sponsors}</span>
														{/if}
														{#if item.introDate}
															<span>
																{new Date(item.introDate).toLocaleDateString('en-US', {
																	month: 'short',
																	day: 'numeric',
																	year: 'numeric'
																})}
															</span>
														{/if}
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
{:catch}
	<section class="py-16 sm:py-24">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<p class="text-gray-600 text-lg mb-4">
				Something went wrong loading legislation summaries.
			</p>
			<a
				href="/legislation"
				class="inline-block px-6 py-3 bg-civic-700 text-white rounded-lg hover:bg-civic-800 transition-colors font-medium"
			>
				Browse all legislation
			</a>
		</div>
	</section>
{/await}
