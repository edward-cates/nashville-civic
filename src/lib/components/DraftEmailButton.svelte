<script lang="ts">
	import { Mail, MapPin, Loader2, AlertCircle, X } from 'lucide-svelte';

	interface Props {
		headline: string;
		topic: string;
		sourceDetail: string;
		level: 'local' | 'state';
	}

	let { headline, topic, sourceDetail, level }: Props = $props();

	type Rep = { name: string; email: string; level: 'local' | 'state'; office?: string };
	type Suggestion = { displayName: string; lat: number; lng: number };

	let open = $state(false);
	let address = $state('');
	let loading = $state(false);
	let error = $state('');

	let suggestions = $state<Suggestion[]>([]);
	let showSuggestions = $state(false);
	let activeSuggestion = $state(-1);
	let suggestTimer: ReturnType<typeof setTimeout> | null = null;
	let lastQueried = '';

	function normalizeAddress(raw: string): string {
		const q = raw.trim();
		if (/^\d{5}$/.test(q)) return `${q} Nashville, TN`;
		if (!q.toLowerCase().includes('nashville')) return `${q}, Nashville, TN`;
		return q;
	}

	function buildSubject(): string {
		return `Regarding ${topic}: ${headline}`;
	}

	function buildBody(recipients: Rep[]): string {
		const salutation =
			recipients.length === 1
				? recipients[0].name
				: recipients.map(r => r.name).join(' and ');

		return `Hi ${salutation},

I'm a constituent writing about ${headline} (${sourceDetail}). I wanted to share my perspective on this.

[Write your thoughts here — what's your position, how does this affect you or your neighborhood, and what would you like them to do?]

Thank you for your time.`;
	}

	function scheduleSuggest(raw: string) {
		if (suggestTimer) clearTimeout(suggestTimer);
		const q = raw.trim();
		if (q.length < 3) {
			suggestions = [];
			showSuggestions = false;
			return;
		}
		if (q === lastQueried) return;
		suggestTimer = setTimeout(() => fetchSuggestions(q), 500);
	}

	async function fetchSuggestions(q: string) {
		lastQueried = q;
		try {
			const res = await fetch(`/api/address-suggest?q=${encodeURIComponent(q)}`);
			const data = await res.json();
			suggestions = data.suggestions || [];
			showSuggestions = suggestions.length > 0;
			activeSuggestion = -1;
		} catch {
			// silent — autocomplete is a nice-to-have
		}
	}

	function pickSuggestion(s: Suggestion) {
		address = s.displayName;
		showSuggestions = false;
		suggestions = [];
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeSuggestion = (activeSuggestion + 1) % suggestions.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeSuggestion =
				activeSuggestion <= 0 ? suggestions.length - 1 : activeSuggestion - 1;
		} else if (e.key === 'Enter' && activeSuggestion >= 0) {
			e.preventDefault();
			pickSuggestion(suggestions[activeSuggestion]);
		} else if (e.key === 'Escape') {
			showSuggestions = false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!address.trim() || loading) return;

		loading = true;
		error = '';
		showSuggestions = false;

		try {
			const query = normalizeAddress(address);
			const res = await fetch(`/api/find-local-rep?address=${encodeURIComponent(query)}`);
			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Could not find your representatives.';
				loading = false;
				return;
			}

			const recipients: Rep[] =
				level === 'state' ? (data.state || []) : data.local ? [data.local] : [];

			if (recipients.length === 0) {
				error =
					level === 'state'
						? "We couldn't find state legislators with an email on file for that address."
						: "We couldn't find your council member's email.";
				loading = false;
				return;
			}

			const to = recipients.map(r => r.email).join(',');
			const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(buildSubject())}&body=${encodeURIComponent(buildBody(recipients))}`;
			window.location.href = mailto;
			loading = false;
			open = false;
			address = '';
		} catch {
			error = 'Something went wrong. Please try again.';
			loading = false;
		}
	}

	function closeForm() {
		open = false;
		error = '';
		showSuggestions = false;
	}
</script>

{#if open}
	<form onsubmit={handleSubmit} class="mt-2 space-y-2">
		<div class="relative">
			<div class="relative">
				<MapPin class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					bind:value={address}
					oninput={() => scheduleSuggest(address)}
					onkeydown={handleKeydown}
					onblur={() => setTimeout(() => (showSuggestions = false), 150)}
					onfocus={() => { if (suggestions.length > 0) showSuggestions = true; }}
					placeholder="Your street address (e.g., 123 Main St)"
					autocomplete="street-address"
					class="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
					required
					autofocus
				/>
			</div>
			{#if showSuggestions}
				<ul class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-md max-h-60 overflow-y-auto z-10">
					{#each suggestions as s, i}
						<li>
							<button
								type="button"
								onmousedown={(e) => { e.preventDefault(); pickSuggestion(s); }}
								class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 {i === activeSuggestion ? 'bg-gray-50' : ''}"
							>
								{s.displayName}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<p class="text-xs text-gray-500">
			Street address is best — zip alone can span multiple legislative districts.
		</p>
		<div class="flex gap-2">
			<button
				type="submit"
				disabled={loading || !address.trim()}
				class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-civic-700 rounded-md hover:bg-civic-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
			>
				{#if loading}
					<Loader2 class="h-4 w-4 animate-spin" />
					Finding {level === 'state' ? 'legislators' : 'rep'}…
				{:else}
					Draft email
				{/if}
			</button>
			<button
				type="button"
				onclick={closeForm}
				aria-label="Cancel"
				class="px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
			>
				<X class="h-4 w-4" />
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
		Email your {level === 'state' ? 'state legislators' : 'rep'}
	</button>
{/if}
