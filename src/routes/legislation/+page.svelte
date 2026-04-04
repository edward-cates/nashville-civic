<script lang="ts">
	import { FileText, ExternalLink, Flame, ChevronDown, ChevronRight, Tag, Search } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/markdown';

	let { data } = $props();

	let searchQuery = $state('');
	let selectedTopic = $state('all');

	// Get unique topics
	let allTopics = $derived.by(() => {
		const topics = new Set<string>();
		for (const item of data.legislation) {
			for (const t of item.topics) topics.add(t);
		}
		return ['all', ...Array.from(topics).sort()];
	});

	// Filter and sort legislation
	let filtered = $derived.by(() => {
		let items = data.legislation;

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			items = items.filter((item: any) =>
				item.title.toLowerCase().includes(q) ||
				item.summary.toLowerCase().includes(q) ||
				item.fileNumber.toLowerCase().includes(q) ||
				item.tension.toLowerCase().includes(q)
			);
		}

		if (selectedTopic !== 'all') {
			items = items.filter((item: any) => item.topics.includes(selectedTopic));
		}

		// Sort by controversy score descending
		return [...items].sort((a: any, b: any) => b.controversyScore - a.controversyScore);
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
					onclick={() => { searchQuery = ''; selectedTopic = 'all'; }}
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

							<!-- Link to Legistar -->
							<div class="mt-3">
								<a
									href={bill.legistarUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1.5 text-sm text-civic-700 hover:text-civic-900 font-medium"
								>
									Official record on Legistar
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
