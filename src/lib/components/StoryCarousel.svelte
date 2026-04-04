<script lang="ts">
	import { Flame, CalendarDays, FileText, ArrowRight } from 'lucide-svelte';

	interface StoryCard {
		headline: string;
		body: string;
		tension: string;
		topic: string;
		interestLevel: 'high' | 'normal';
		controversyScore: number; // 1-10
		source: 'meeting' | 'legislation';
		sourceDetail: string;
		link?: string;
		linkLabel?: string;
	}

	interface Props {
		cards: StoryCard[];
	}

	let { cards }: Props = $props();

	// Controversy bar color
	function barColor(score: number): string {
		if (score >= 7) return 'bg-red-500';
		if (score >= 4) return 'bg-amber-400';
		return 'bg-gray-300';
	}
</script>

{#if cards.length > 0}
	<div class="relative -mx-4 sm:mx-0">
		<div class="flex gap-4 overflow-x-auto px-4 sm:px-0 pb-4 snap-x snap-mandatory scrollbar-thin">
			{#each cards as card}
				<article
					class="snap-start shrink-0 w-[85vw] sm:w-[340px] bg-white rounded-xl shadow-sm border {card.controversyScore >= 7 ? 'border-amber-200' : 'border-gray-100'} p-5 flex flex-col justify-between"
				>
					<div>
						<!-- Header: source + topic + score -->
						<div class="flex items-center gap-2 mb-3 flex-wrap">
							{#if card.source === 'meeting'}
								<CalendarDays class="h-3.5 w-3.5 text-civic-600 shrink-0" />
							{:else}
								<FileText class="h-3.5 w-3.5 text-civic-600 shrink-0" />
							{/if}
							<span class="text-xs text-gray-400 truncate max-w-[140px]">{card.sourceDetail}</span>
							<span class="text-xs bg-civic-50 text-civic-600 rounded px-1.5 py-0.5 shrink-0">{card.topic}</span>
						</div>

						<!-- Headline -->
						<h3 class="text-base font-semibold text-gray-900 mb-2 leading-snug line-clamp-2">{card.headline}</h3>

						<!-- Body (only if different from headline) -->
						{#if card.body && card.body !== card.headline}
							<p class="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{card.body}</p>
						{/if}

						<!-- Tension / Both sides -->
						{#if card.tension}
							<p class="text-sm text-gray-500 italic leading-relaxed border-l-2 {card.controversyScore >= 7 ? 'border-amber-400' : card.controversyScore >= 4 ? 'border-amber-300' : 'border-gray-200'} pl-2.5 line-clamp-3">
								{card.tension}
							</p>
						{/if}
					</div>

					<!-- Footer: controversy bar + link -->
					<div class="mt-4 pt-3 border-t border-gray-100 space-y-2.5">
						<!-- Controversy score bar -->
						<div class="flex items-center gap-2">
							<span class="text-xs text-gray-400 shrink-0 w-20">Controversy</span>
							<div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
								<div
									class="{barColor(card.controversyScore)} h-full rounded-full transition-all"
									style="width: {card.controversyScore * 10}%"
								></div>
							</div>
							<span class="text-xs font-medium {card.controversyScore >= 7 ? 'text-red-600' : card.controversyScore >= 4 ? 'text-amber-600' : 'text-gray-400'} shrink-0">{card.controversyScore}/10</span>
						</div>

						<!-- Deep link -->
						{#if card.link}
							<a
								href={card.link}
								class="inline-flex items-center gap-1 text-sm font-medium text-civic-700 hover:text-civic-900 transition-colors"
							>
								{card.linkLabel || 'Go deeper'}
								<ArrowRight class="h-3.5 w-3.5" />
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</div>
{/if}

<style>
	.scrollbar-thin {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}
	.scrollbar-thin::-webkit-scrollbar {
		height: 6px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}
</style>
