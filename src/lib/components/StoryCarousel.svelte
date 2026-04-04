<script lang="ts">
	import { Flame, ChevronLeft, ChevronRight, CalendarDays, FileText, Pause, Play } from 'lucide-svelte';

	interface StoryCard {
		headline: string;
		body: string;
		tension: string;
		topic: string;
		interestLevel: 'high' | 'normal';
		source: 'meeting' | 'legislation';
		sourceDetail: string;
	}

	interface Props {
		cards: StoryCard[];
	}

	let { cards }: Props = $props();

	let current = $state(0);
	let paused = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function next() {
		current = (current + 1) % cards.length;
	}

	function prev() {
		current = (current - 1 + cards.length) % cards.length;
	}

	function goTo(index: number) {
		current = index;
	}

	function togglePause() {
		paused = !paused;
	}

	$effect(() => {
		if (intervalId) clearInterval(intervalId);
		if (!paused && cards.length > 1) {
			intervalId = setInterval(next, 6000);
		}
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

{#if cards.length > 0}
	{@const card = cards[current]}
	<div class="relative">
		<div class="bg-white rounded-xl shadow-sm border {card.interestLevel === 'high' ? 'border-amber-200' : 'border-civic-100'} p-6 sm:p-8 min-h-[220px] flex flex-col justify-between">
			<!-- Card content -->
			<div>
				<div class="flex items-center gap-2 mb-3">
					{#if card.source === 'meeting'}
						<CalendarDays class="h-4 w-4 text-civic-600 shrink-0" />
					{:else}
						<FileText class="h-4 w-4 text-civic-600 shrink-0" />
					{/if}
					<span class="text-xs text-gray-500">{card.sourceDetail}</span>
					<span class="text-xs bg-civic-50 text-civic-600 rounded px-1.5 py-0.5">{card.topic}</span>
					{#if card.interestLevel === 'high'}
						<Flame class="h-4 w-4 text-amber-500 shrink-0" />
					{/if}
				</div>

				<h3 class="text-lg font-semibold text-gray-900 mb-2 leading-snug">{card.headline}</h3>

				{#if card.body !== card.headline}
					<p class="text-gray-700 leading-relaxed mb-3">{card.body}</p>
				{/if}

				{#if card.tension}
					<p class="text-sm text-gray-600 italic leading-relaxed border-l-2 {card.interestLevel === 'high' ? 'border-amber-400' : 'border-gray-300'} pl-3">
						{card.tension}
					</p>
				{/if}
			</div>

			<!-- Navigation -->
			<div class="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
				<div class="flex items-center gap-2">
					<button onclick={prev} class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500" aria-label="Previous story">
						<ChevronLeft class="h-4 w-4" />
					</button>
					<button onclick={togglePause} class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500" aria-label={paused ? 'Resume' : 'Pause'}>
						{#if paused}
							<Play class="h-4 w-4" />
						{:else}
							<Pause class="h-4 w-4" />
						{/if}
					</button>
					<button onclick={next} class="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500" aria-label="Next story">
						<ChevronRight class="h-4 w-4" />
					</button>
				</div>

				<!-- Dots -->
				<div class="flex items-center gap-1.5">
					{#each cards as _, i}
						<button
							onclick={() => goTo(i)}
							class="w-2 h-2 rounded-full transition-colors {i === current ? 'bg-civic-600' : 'bg-gray-300 hover:bg-gray-400'}"
							aria-label="Go to story {i + 1}"
						></button>
					{/each}
				</div>

				<span class="text-xs text-gray-400">{current + 1} / {cards.length}</span>
			</div>
		</div>
	</div>
{/if}
