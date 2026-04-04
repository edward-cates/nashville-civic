<script lang="ts">
	import { ExternalLink, Flame, Search } from 'lucide-svelte';
	import LoadingPulse from '$lib/components/LoadingPulse.svelte';
	import { renderMarkdown } from '$lib/markdown';
	import type { NarrativeLegislation } from '$lib/server/narrative';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedTopic = $state('all');
	let selectedLevel = $state('all');

	// Resolved legislation stored here once the promise settles
	let legislation = $state<NarrativeLegislation[]>([]);
	let loaded = $state(false);
	let loadError = $state(false);

	// Kick off resolution
	data.aiData.then((result) => {
		legislation = result;
		loaded = true;
	}).catch(() => {
		loadError = true;
	});

	// Get unique topics (reactive, updates when legislation changes)
	let allTopics = $derived.by(() => {
		const topics = new Set<string>();
		for (const item of legislation) {
			for (const t of item.topics) topics.add(t);
		}
		return ['all', ...Array.from(topics).sort()];
	});

	// Filter and sort legislation (reactive)
	let filtered = $derived.by(() => {
		let items = legislation;

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			items = items.filter((item) =>
				item.title.toLowerCase().includes(q) ||
				item.summary.toLowerCase().includes(q) ||
				item.fileNumber.toLowerCase().includes(q) ||
				item.tension.toLowerCase().includes(q)
			);
		}

		if (selectedTopic !== 'all') {
			items = items.filter((item) => item.topics.includes(selectedTopic));
		}

		if (selectedLevel !== 'all') {
			items = items.filter((item) => item.level === selectedLevel);
		}

		// Sort by controversy score descending
		return [...items].sort((a, b) => b.controversyScore - a.controversyScore);
	});

	function barColor(score: number): string {
		if (score >= 7) return 'bg-red-500';
		if (score >= 4) return 'bg-amber-400';
		return 'bg-gray-300';
	}
</script>

<svelte:head>
	<title>All Bills & Legislation — Nashville Civic</title>
	<meta name="description" content="Every bill, ordinance, and resolution Nashville Metro Council is working on — explained in plain language with both sides of every debate." />
</svelte:head>

<section class="bg-civic-900 text-white py-12 sm:py-16">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl sm:text-4xl font-bold mb-3">Bills & Legislation</h1>
		<p class="text-civic-200 text-lg leading-relaxed">
			Every bill, ordinance, and resolution Metro Council is working on.
			Plain language. Both sides. No jargon.
		</p>
	</div>
</section>

{#if loadError}
	<!-- Error state -->
	<section class="py-16 sm:py-24">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
			<p class="text-gray-600 text-lg mb-4">
				Something went wrong loading legislation summaries. We're working on it.
			</p>
			<p class="text-gray-400 text-sm mb-6">
				The AI summarizer may be temporarily unavailable. Try refreshing in a moment.
			</p>
			<a
				href="/whats-happening"
				class="inline-block px-6 py-3 bg-civic-700 text-white rounded-lg hover:bg-civic-800 transition-colors font-medium"
			>
				Back to What's Happening
			</a>
		</div>
	</section>
{:else if !loaded}
	<!-- Loading state: disabled search bar -->
	<section class="bg-white border-b border-gray-200 sticky top-0 z-10">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 py-4">
			<div class="flex flex-col sm:flex-row gap-3">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
					<input
						type="text"
						disabled
						placeholder="Search bills, topics, keywords..."
						class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
					/>
				</div>
				<select disabled class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
					<option>All Topics</option>
				</select>
				<select disabled class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed">
					<option>All Levels</option>
				</select>
			</div>
			<p class="text-xs text-gray-400 mt-2">Loading bills...</p>
		</div>
	</section>

	<!-- Loading: Skeleton cards -->
	<section class="py-8 sm:py-12">
		<div class="max-w-4xl mx-auto px-4 sm:px-6">
			<div class="space-y-4">
				{#each Array(4) as _}
					<div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
						<LoadingPulse lines={4} label="Summarizing {data.rawCount} bills..." />
					</div>
				{/each}
			</div>
		</div>
	</section>
{:else}
	<!-- Search & Filter -->
	<section class="bg-white border-b border-gray-200 sticky top-0 z-10">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 py-4">
			<div class="flex flex-col sm:flex-row gap-3">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search bills, topics, keywords..."
						class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
					/>
				</div>
				<select
					bind:value={selectedTopic}
					class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent bg-white"
				>
					{#each allTopics as topic}
						<option value={topic}>{topic === 'all' ? 'All Topics' : topic}</option>
					{/each}
				</select>
				<select
					bind:value={selectedLevel}
					class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent bg-white"
				>
					<option value="all">All Levels</option>
					<option value="local">Metro Nashville</option>
					<option value="state">Tennessee State</option>
				</select>
			</div>
			<p class="text-xs text-gray-400 mt-2">
				{filtered.length} bill{filtered.length !== 1 ? 's' : ''} · sorted by controversy
			</p>
		</div>
	</section>

	<!-- Bills List -->
	<section class="py-8 sm:py-12">
		<div class="max-w-4xl mx-auto px-4 sm:px-6">
			{#if filtered.length === 0}
				<div class="text-center py-16 text-gray-500">
					<p class="text-lg">No bills match your search.</p>
					<button
						onclick={() => { searchQuery = ''; selectedTopic = 'all'; selectedLevel = 'all'; }}
						class="mt-3 text-civic-700 underline hover:text-civic-900"
					>Clear filters</button>
				</div>
			{:else}
				<div class="space-y-4">
					{#each filtered as bill}
						<article class="bg-white rounded-xl border {bill.controversyScore >= 7 ? 'border-amber-200' : 'border-gray-100'} shadow-sm overflow-hidden">
							<div class="p-5 sm:p-6">
								<!-- Header row -->
								<div class="flex items-start justify-between gap-3 mb-3">
									<div class="flex items-center gap-2 flex-wrap">
										<span class="text-xs font-semibold rounded px-1.5 py-0.5 {bill.level === 'state' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">{bill.level === 'state' ? 'State' : 'Metro'}</span>
										<code class="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{bill.fileNumber}</code>
										<span class="text-xs bg-civic-50 text-civic-600 rounded px-1.5 py-0.5">{bill.type}</span>
										{#each bill.topics as topic}
											<span class="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{topic}</span>
										{/each}
									</div>
									{#if bill.controversyScore >= 7}
										<Flame class="h-5 w-5 text-amber-500 shrink-0" />
									{/if}
								</div>

								<!-- Title / Summary -->
								{#if bill.summary}
									<div class="text-base text-gray-800 leading-relaxed mb-2 prose prose-sm max-w-none">
										{@html renderMarkdown(bill.summary)}
									</div>
									<p class="text-sm text-gray-400 mb-2">{bill.title}</p>
								{:else}
									<h2 class="text-base text-gray-800 mb-2 leading-relaxed">{bill.title}</h2>
								{/if}

								<!-- Both sides -->
								{#if bill.tension}
									<div class="border-l-3 {bill.controversyScore >= 7 ? 'border-amber-400 bg-amber-50/50' : bill.controversyScore >= 4 ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200 bg-gray-50/50'} rounded-r-lg px-4 py-3 mb-3">
										<p class="text-sm font-medium text-gray-700 mb-1">Both sides:</p>
										<p class="text-sm text-gray-600 leading-relaxed italic">{bill.tension}</p>
									</div>
								{/if}

								<!-- Status + Controversy -->
								<div class="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 pt-3 border-t border-gray-100">
									<div class="flex-1">
										<p class="text-sm text-gray-600">
											<span class="font-medium">Status:</span> {bill.statusExplained}
										</p>
									</div>
									<div class="flex items-center gap-2 sm:w-48">
										<span class="text-xs text-gray-400 shrink-0">Controversy</span>
										<div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
											<div
												class="{barColor(bill.controversyScore)} h-full rounded-full"
												style="width: {bill.controversyScore * 10}%"
											></div>
										</div>
										<span class="text-xs font-medium {bill.controversyScore >= 7 ? 'text-red-600' : bill.controversyScore >= 4 ? 'text-amber-600' : 'text-gray-400'}">{bill.controversyScore}/10</span>
									</div>
								</div>

								<!-- Official record link -->
								<div class="mt-3">
									<a
										href={bill.sourceUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1.5 text-sm text-civic-700 hover:text-civic-900 font-medium"
									>
										Official record
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
