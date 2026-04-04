<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import StoryCarousel from '$lib/components/StoryCarousel.svelte';
	import LoadingPulse from '$lib/components/LoadingPulse.svelte';
	import { CalendarDays, FileText, Lightbulb, ArrowRight, ChevronDown, ChevronRight, Flame, Tag } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/markdown';

	let { data } = $props();

	// Topic grouping — computed from resolved AI data
	function groupByTopic(legislation: any[]) {
		if (!legislation || legislation.length === 0) return [];
		const groups: Record<string, any[]> = {};
		for (const item of legislation) {
			const topics = item.topics && item.topics.length > 0 ? item.topics : ['Other'];
			for (const topic of topics) {
				if (!groups[topic]) groups[topic] = [];
				groups[topic].push(item);
			}
		}
		for (const topic of Object.keys(groups)) {
			groups[topic].sort((a: any, b: any) => {
				if (a.interestLevel === 'high' && b.interestLevel !== 'high') return -1;
				if (a.interestLevel !== 'high' && b.interestLevel === 'high') return 1;
				return 0;
			});
		}
		return Object.entries(groups).sort(([a], [b]) => {
			if (a === 'Other') return 1;
			if (b === 'Other') return -1;
			return a.localeCompare(b);
		});
	}

	let expandedTopics = $state<Record<string, boolean>>({});

	function toggleTopic(topic: string) {
		expandedTopics[topic] = !expandedTopics[topic];
	}

	function initExpanded(topicGroups: [string, any[]][]) {
		if (topicGroups.length > 0 && Object.keys(expandedTopics).length === 0) {
			const initial: Record<string, boolean> = {};
			for (const [topic, items] of topicGroups) {
				initial[topic] = items.some((i: any) => i.interestLevel === 'high');
			}
			expandedTopics = initial;
		}
	}
</script>

<svelte:head>
	<title>Nashville Civic - Know Your Government</title>
	<meta
		name="description"
		content="Find out who represents you in Nashville. Understand what's happening at Metro Council. Make your voice heard."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-civic-900 text-white py-16 sm:py-24">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
		<h1 class="text-3xl sm:text-5xl font-bold leading-tight mb-6">
			45 people represent you in Nashville.<br />
			<span class="text-civic-300">Do you know any of them?</span>
		</h1>
		<p class="text-lg sm:text-xl text-civic-200 max-w-2xl mx-auto mb-10 leading-relaxed">
			Your Metro Council member decides what gets built in your neighborhood, how your tax dollars
			get spent, and whether that pothole on your street gets fixed. Let's find out who they are.
		</p>
		<AddressSearch />
		<p class="mt-4 text-sm text-civic-400">
			Your address is only used to look up your representatives. We never store it.
		</p>
	</div>
</section>

<!-- AI-powered content: streams in while page is already visible -->
{#await data.aiData}
	<!-- Loading state -->
	<section class="py-12 sm:py-16 bg-civic-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-6">This Week in Nashville</h2>
			<div class="bg-white rounded-xl shadow-sm border border-civic-100 p-6 sm:p-8">
				<LoadingPulse label="Summarizing {data.meetingCount} meetings and {data.legislationCount} bills..." lines={4} />
			</div>
		</div>
	</section>
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-8">
				<Tag class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">By Topic</h2>
			</div>
			<div class="space-y-3">
				{#each Array(4) as _}
					<div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
						<LoadingPulse label="Classifying legislation..." lines={2} />
					</div>
				{/each}
			</div>
		</div>
	</section>
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-8">
				<CalendarDays class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Meetings This Week</h2>
			</div>
			<div class="space-y-6">
				{#each Array(3) as _}
					<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<LoadingPulse label="Analyzing agenda items..." lines={3} />
					</div>
				{/each}
			</div>
		</div>
	</section>
{:then ai}
	<!-- Story Cards -->
	{#if ai.storyCards && ai.storyCards.length > 0}
		<section class="py-12 sm:py-16 bg-civic-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-6">This Week in Nashville</h2>
				<StoryCarousel cards={ai.storyCards} />
			</div>
		</section>
	{/if}

	<!-- By Topic -->
	{@const topicGroups = groupByTopic(ai.legislation)}
	{#if topicGroups.length > 0}
		{(initExpanded(topicGroups), '')}
		<section class="py-12 sm:py-16 bg-gray-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-8">
					<Tag class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">By Topic</h2>
				</div>
				<div class="space-y-3">
					{#each topicGroups as [topic, items]}
						<div class="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
							<button
								onclick={() => toggleTopic(topic)}
								class="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
							>
								<span class="flex items-center gap-2">
									<span class="font-semibold text-civic-800">{topic}</span>
									<span class="text-xs bg-civic-100 text-civic-700 rounded-full px-2 py-0.5 font-medium">{items.length}</span>
									{#if items.some((i) => i.interestLevel === 'high')}
										<Flame class="h-4 w-4 text-amber-500" />
									{/if}
								</span>
								{#if expandedTopics[topic]}
									<ChevronDown class="h-5 w-5 text-gray-400" />
								{:else}
									<ChevronRight class="h-5 w-5 text-gray-400" />
								{/if}
							</button>
							{#if expandedTopics[topic]}
								<div class="border-t border-gray-100 px-5 py-3 space-y-3">
									{#each items as item}
										<div class="pl-3 border-l-2 {item.interestLevel === 'high' ? 'border-amber-500' : 'border-gray-200'}">
											<div class="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none">{@html renderMarkdown(item.summary)}</div>
											{#if item.tension}
												<p class="text-sm italic text-gray-500 mt-1">{item.tension}</p>
											{/if}
											<p class="text-xs text-gray-400 mt-1">
												<span class="font-semibold {item.level === 'state' ? 'text-amber-600' : 'text-emerald-600'}">{item.level === 'state' ? 'State' : 'Metro'}</span>
												&middot; {item.fileNumber} &middot; {item.status}
											</p>
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

	<!-- Meetings This Week -->
	{#if ai.meetings && ai.meetings.length > 0}
		<section class="py-12 sm:py-16">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-8">
					<CalendarDays class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Meetings This Week</h2>
				</div>
				<div class="space-y-6">
					{#each ai.meetings as meeting}
						<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
								<h3 class="text-lg font-semibold text-civic-800">{meeting.body}</h3>
								<time class="text-sm text-gray-500">
									{new Date(meeting.date).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric'
									})} at {meeting.time}
								</time>
							</div>
							{#if meeting.summary}
								<p class="text-gray-600 text-sm mb-4">{meeting.summary}</p>
							{/if}

							{#if meeting.issues && meeting.issues.length > 0}
								<div class="space-y-2 mb-4">
									{#each meeting.issues as issue}
										<div class="pl-3 border-l-2 {issue.interestLevel === 'high' ? 'border-amber-500' : 'border-gray-200'}">
											<p class="text-sm font-semibold text-gray-800">{issue.title}</p>
											<p class="text-sm text-gray-600">{issue.summary}</p>
											{#if issue.tension}
												<p class="text-sm italic text-gray-500 mt-0.5">{issue.tension}</p>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							<div class="flex flex-wrap gap-3 text-sm">
								{#if meeting.location}
									<span class="text-gray-500">{meeting.location}</span>
								{/if}
								{#if meeting.agendaUrl}
									<a href={meeting.agendaUrl} target="_blank" rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2">
										View agenda
									</a>
								{/if}
								{#if meeting.videoUrl}
									<a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2">
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
	<!-- AI failed — show a message -->
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center text-gray-500">
			<p>Having trouble loading AI summaries right now. <a href="/legislation" class="text-civic-700 underline">View raw legislation</a> or try refreshing.</p>
		</div>
	</section>
{/await}

<!-- Did You Know -->
<section class="py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<div class="flex items-center gap-3 mb-8">
			<Lightbulb class="h-7 w-7 text-civic-700" />
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Did You Know?</h2>
		</div>
		<div class="space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				Nashville has a consolidated city-county government, meaning Metro Council handles both city
				and county business. It's been that way since 1963.
			</p>
			<p>
				There are 40 council members total: 35 represent specific districts (like yours), and 5 are
				"at-large" members who represent all of Nashville.
			</p>
			<p>
				You can speak at most council and committee meetings. You get two minutes, and they actually
				have to listen.
			</p>
		</div>
		<div class="mt-8">
			<a
				href="/how-it-works"
				class="inline-flex items-center gap-2 text-civic-700 hover:text-civic-900 font-semibold text-lg underline underline-offset-4"
			>
				Learn how Nashville's government works
				<ArrowRight class="h-5 w-5" />
			</a>
		</div>
	</div>
</section>
