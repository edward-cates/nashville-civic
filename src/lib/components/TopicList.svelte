<script lang="ts">
	import { ChevronDown, ChevronRight, Flame, Tag } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/markdown';

	let { legislation }: { legislation: any[] } = $props();

	function groupByTopic(items: any[]) {
		if (!items || items.length === 0) return [];
		const groups: Record<string, any[]> = {};
		for (const item of items) {
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
	let topicGroups = $derived(groupByTopic(legislation));

	$effect(() => {
		if (topicGroups.length > 0 && Object.keys(expandedTopics).length === 0) {
			const initial: Record<string, boolean> = {};
			for (const [topic, items] of topicGroups) {
				initial[topic] = items.some((i: any) => i.interestLevel === 'high');
			}
			expandedTopics = initial;
		}
	});

	function toggleTopic(topic: string) {
		expandedTopics[topic] = !expandedTopics[topic];
	}
</script>

{#if topicGroups.length > 0}
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
