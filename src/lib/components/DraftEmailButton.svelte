<script lang="ts">
	import { Mail, MapPin, Loader2, AlertCircle } from 'lucide-svelte';

	interface Props {
		headline: string;
		topic: string;
		sourceDetail: string;
	}

	let { headline, topic, sourceDetail }: Props = $props();

	let open = $state(false);
	let address = $state('');
	let loading = $state(false);
	let error = $state('');

	function normalizeAddress(raw: string): string {
		const q = raw.trim();
		if (/^\d{5}$/.test(q)) return `${q} Nashville, TN`;
		if (!q.toLowerCase().includes('nashville')) return `${q}, Nashville, TN`;
		return q;
	}

	function buildSubject(): string {
		return `Regarding ${topic}: ${headline}`;
	}

	function buildBody(repName: string): string {
		return `Hi ${repName},

I'm a constituent writing about ${headline} (${sourceDetail}). I wanted to share my perspective on this.

[Write your thoughts here — what's your position, how does this affect you or your neighborhood, and what would you like them to do?]

Thank you for your time.`;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!address.trim() || loading) return;

		loading = true;
		error = '';

		try {
			const query = normalizeAddress(address);
			const res = await fetch(`/api/find-local-rep?address=${encodeURIComponent(query)}`);
			const data = await res.json();

			if (!res.ok || !data.rep?.email) {
				error = data.error || 'Could not find your council member.';
				loading = false;
				return;
			}

			const mailto = `mailto:${encodeURIComponent(data.rep.email)}?subject=${encodeURIComponent(buildSubject())}&body=${encodeURIComponent(buildBody(data.rep.name))}`;
			window.location.href = mailto;
			loading = false;
			open = false;
			address = '';
		} catch {
			error = 'Something went wrong. Please try again.';
			loading = false;
		}
	}
</script>

{#if open}
	<form onsubmit={handleSubmit} class="mt-2 space-y-2">
		<div class="relative">
			<MapPin class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				bind:value={address}
				placeholder="Your zip code (e.g., 37203)"
				class="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
				required
				autofocus
			/>
		</div>
		<div class="flex gap-2">
			<button
				type="submit"
				disabled={loading || !address.trim()}
				class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-civic-700 rounded-md hover:bg-civic-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if loading}
					<Loader2 class="h-4 w-4 animate-spin" />
					Finding rep…
				{:else}
					Draft email
				{/if}
			</button>
			<button
				type="button"
				onclick={() => { open = false; error = ''; }}
				class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
			>
				Cancel
			</button>
		</div>
		{#if error}
			<div class="flex items-start gap-1.5 text-xs text-red-600">
				<AlertCircle class="h-3.5 w-3.5 shrink-0 mt-0.5" />
				<span>{error}</span>
			</div>
		{/if}
	</form>
{:else}
	<button
		type="button"
		onclick={() => { open = true; }}
		class="inline-flex items-center gap-1.5 text-sm font-medium text-civic-700 hover:text-civic-900 transition-colors"
	>
		<Mail class="h-3.5 w-3.5" />
		Email your rep
	</button>
{/if}
