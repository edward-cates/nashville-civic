<script lang="ts">
	import RepCard from '$lib/components/RepCard.svelte';
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import { AlertCircle } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>My Representatives — Nashville Civic</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	{#if !data.address}
		<div class="text-center py-12">
			<h1 class="text-3xl font-bold text-gray-900 mb-4">Find Your Representatives</h1>
			<p class="text-gray-600 mb-8 max-w-lg mx-auto">
				Enter your Nashville address to see everyone who represents you — from Metro Council to the U.S. Senate.
			</p>
			<AddressSearch />
		</div>
	{:else}
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Your Representatives</h1>
			<p class="mt-2 text-gray-600">
				Showing results for: <span class="font-medium text-gray-900">{data.displayAddress}</span>
			</p>
			{#if data.district}
				<p class="mt-1 text-sm text-civic-700 font-medium">Metro Council District {data.district}</p>
			{/if}
		</div>

		{#if data.error}
			<div class="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
				<AlertCircle class="h-5 w-5 shrink-0" />
				<p class="text-sm">{data.error}</p>
			</div>
		{/if}

		{#if data.reps.length === 0}
			<div class="text-center py-12 text-gray-500">
				<p>No representatives found for this address. Make sure you entered a Nashville, TN address.</p>
			</div>
		{:else}
			<!-- Local reps -->
			{@const localReps = data.reps.filter((r: any) => r.level === 'local')}
			{@const stateReps = data.reps.filter((r: any) => r.level === 'state')}
			{@const federalReps = data.reps.filter((r: any) => r.level === 'federal')}

			{#if localReps.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<span class="w-3 h-3 rounded-full bg-emerald-500"></span>
						Local Government
					</h2>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each localReps as rep}
							<RepCard {rep} />
						{/each}
					</div>
				</div>
			{/if}

			{#if stateReps.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<span class="w-3 h-3 rounded-full bg-amber-500"></span>
						State Government
					</h2>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each stateReps as rep}
							<RepCard {rep} />
						{/each}
					</div>
				</div>
			{/if}

			{#if federalReps.length > 0}
				<div class="mb-8">
					<h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
						<span class="w-3 h-3 rounded-full bg-civic-500"></span>
						Federal Government
					</h2>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each federalReps as rep}
							<RepCard {rep} />
						{/each}
					</div>
				</div>
			{/if}
		{/if}

		<!-- Search again -->
		<div class="mt-12 pt-8 border-t border-gray-200">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Search a different address</h3>
			<AddressSearch />
		</div>
	{/if}
</div>
