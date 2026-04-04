<script lang="ts">
	import { Phone, Mail, Globe, ExternalLink, User } from 'lucide-svelte';
	import type { Representative } from '$lib/types';

	interface Props {
		rep: Representative;
	}

	let { rep }: Props = $props();

	const levelColors: Record<string, string> = {
		local: 'bg-emerald-100 text-emerald-800',
		state: 'bg-amber-100 text-amber-800',
		federal: 'bg-civic-100 text-civic-800'
	};

	const levelLabels: Record<string, string> = {
		local: 'Local',
		state: 'State',
		federal: 'Federal'
	};

	const partyColors: Record<string, string> = {
		Democratic: 'text-blue-600',
		Republican: 'text-red-600',
		Independent: 'text-purple-600'
	};
</script>

<div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
	<div class="flex items-start gap-4">
		{#if rep.photoUrl}
			<img
				src={rep.photoUrl}
				alt={rep.name}
				class="w-16 h-16 rounded-full object-cover bg-gray-100 shrink-0"
			/>
		{:else}
			<div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
				<User class="h-8 w-8 text-gray-400" />
			</div>
		{/if}

		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 flex-wrap">
				<h3 class="text-lg font-semibold text-gray-900">{rep.name}</h3>
				{#if rep.party}
					<span class={`text-sm font-medium ${partyColors[rep.party] || 'text-gray-600'}`}>
						({rep.party})
					</span>
				{/if}
			</div>

			<p class="text-sm text-gray-600 mt-0.5">{rep.office}</p>

			{#if rep.district}
				<p class="text-sm text-gray-500">District {rep.district}</p>
			{/if}

			<div class="mt-1">
				<span class={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[rep.level]}`}>
					{levelLabels[rep.level]}
				</span>
			</div>
		</div>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		{#if rep.phone}
			<a
				href="tel:{rep.phone}"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
			>
				<Phone class="h-4 w-4" />
				{rep.phone}
			</a>
		{/if}

		{#if rep.email}
			<a
				href="/contact?rep={encodeURIComponent(rep.name)}&email={encodeURIComponent(rep.email)}&level={rep.level}"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-civic-700 rounded-md hover:bg-civic-800 transition-colors"
			>
				<Mail class="h-4 w-4" />
				Send Message
			</a>
		{/if}

		{#if rep.website}
			<a
				href={rep.website}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
			>
				<Globe class="h-4 w-4" />
				Website
				<ExternalLink class="h-3 w-3" />
			</a>
		{/if}
	</div>
</div>
