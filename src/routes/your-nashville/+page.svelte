<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import RepCard from '$lib/components/RepCard.svelte';
	import { MapPin, Phone, Mail, Globe, Building2, Landmark, Users } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/markdown';

	let { data } = $props();
</script>

<svelte:head>
	<title>Your Nashville {data.district ? `- District ${data.district}` : ''}</title>
	<meta
		name="description"
		content="Find out exactly who represents you in Nashville government, from your neighborhood council member to your U.S. senators."
	/>
</svelte:head>

{#if !data.address}
	<!-- No address yet -->
	<section class="py-16 sm:py-24">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<MapPin class="h-12 w-12 text-civic-600 mx-auto mb-6" />
			<h1 class="text-3xl sm:text-4xl font-bold text-civic-900 mb-4">
				Let's find your Nashville representatives
			</h1>
			<p class="text-lg text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
				Enter your address and we'll show you everyone who represents you, from your local council
				member all the way up to your U.S. senators. It takes about two seconds.
			</p>
			<AddressSearch />
		</div>
	</section>
{:else if data.error}
	<!-- Error state -->
	<section class="py-16 sm:py-24">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<div
				class="bg-red-50 border border-red-200 rounded-xl p-6 sm:p-8 mb-10 max-w-xl mx-auto"
			>
				<p class="text-red-800 text-lg">{data.error}</p>
			</div>
			<AddressSearch />
		</div>
	</section>
{:else}
	<!-- Results -->

	<!-- District & Council Member Section -->
	<section class="bg-civic-900 text-white py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			{#if data.district}
				<p class="text-civic-300 text-sm font-medium uppercase tracking-wider mb-2">
					Your neighborhood
				</p>
				<h1 class="text-3xl sm:text-4xl font-bold mb-2">
					You live in District {data.district}
				</h1>
			{:else}
				<h1 class="text-3xl sm:text-4xl font-bold mb-2">Your Nashville Representatives</h1>
			{/if}
			<p class="text-civic-200 text-lg mb-8">
				Here's who you searched for: <span class="text-white font-medium">{data.address}</span>
			</p>

			{#if data.localRep}
				<div class="bg-civic-800/50 border border-civic-700 rounded-xl p-6 sm:p-8">
					<div class="flex items-center gap-3 mb-4">
						<Building2 class="h-6 w-6 text-civic-300" />
						<h2 class="text-xl font-semibold text-civic-100">Your Metro Council Member</h2>
					</div>
					<p class="text-2xl sm:text-3xl font-bold text-white mb-2">{data.localRep.name}</p>
					<p class="text-civic-300 mb-4">{data.localRep.office}</p>

					{#if data.localRepNarrative}
						<div class="text-civic-100 leading-relaxed mb-6 text-lg prose prose-invert max-w-none">
							{@html renderMarkdown(data.localRepNarrative)}
						</div>
					{:else}
						<p class="text-civic-200 leading-relaxed mb-6">
							This is the person who represents your specific neighborhood on Metro Council. They vote
							on zoning, the city budget, and local laws that affect your daily life. If you have
							a concern about your neighborhood, this is who to call.
						</p>
					{/if}

					<div class="flex flex-wrap gap-3">
						{#if data.localRep.phone}
							<a
								href="tel:{data.localRep.phone}"
								class="inline-flex items-center gap-2 px-4 py-2 bg-civic-700 hover:bg-civic-600 rounded-lg text-white font-medium transition-colors"
							>
								<Phone class="h-4 w-4" />
								Call
							</a>
						{/if}
						{#if data.localRep.email}
							<a
								href="mailto:{data.localRep.email}"
								class="inline-flex items-center gap-2 px-4 py-2 bg-civic-700 hover:bg-civic-600 rounded-lg text-white font-medium transition-colors"
							>
								<Mail class="h-4 w-4" />
								Email
							</a>
						{/if}
						{#if data.localRep.website}
							<a
								href={data.localRep.website}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 px-4 py-2 bg-civic-700 hover:bg-civic-600 rounded-lg text-white font-medium transition-colors"
							>
								<Globe class="h-4 w-4" />
								Website
							</a>
						{/if}
					</div>
				</div>
			{/if}

			{#if data.mayor}
				<div class="mt-6 bg-civic-800/30 border border-civic-700/50 rounded-xl p-6">
					<div class="flex items-center gap-3 mb-3">
						<Landmark class="h-5 w-5 text-civic-400" />
						<h3 class="text-lg font-semibold text-civic-200">The Mayor</h3>
					</div>
					<p class="text-xl font-bold text-white mb-1">{data.mayor.name}</p>
					<p class="text-civic-300 text-sm mb-3">{data.mayor.office}</p>
					<p class="text-civic-200 text-sm leading-relaxed mb-4">
						The mayor runs Nashville's day-to-day government and proposes the city budget.
						While your council member votes on laws, the mayor decides how they get carried out.
					</p>
					<div class="flex flex-wrap gap-3 text-sm">
						{#if data.mayor.phone}
							<a
								href="tel:{data.mayor.phone}"
								class="text-civic-300 hover:text-white transition-colors underline underline-offset-2"
							>
								{data.mayor.phone}
							</a>
						{/if}
						{#if data.mayor.email}
							<a
								href="mailto:{data.mayor.email}"
								class="text-civic-300 hover:text-white transition-colors underline underline-offset-2"
							>
								{data.mayor.email}
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- State Legislators -->
	{#if data.stateReps && data.stateReps.length > 0}
		<section class="py-12 sm:py-16">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-4">
					<Users class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Your State Legislators</h2>
				</div>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">
					These folks work at the Tennessee State Capitol. They make decisions about state taxes,
					education policy, gun laws, healthcare, and a lot of things that affect Nashville but get
					decided at the state level. Tennessee's legislature meets from January through about May
					each year.
				</p>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.stateReps as rep}
						<RepCard {rep} />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Federal Representatives -->
	{#if data.federalReps && data.federalReps.length > 0}
		<section class="py-12 sm:py-16 bg-gray-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-4">
					<Landmark class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">
						Your Federal Representatives
					</h2>
				</div>
				<p class="text-gray-600 text-lg mb-8 leading-relaxed">
					These are the people who represent you in Washington, D.C. Your U.S. House member
					represents your congressional district, and your two U.S. Senators represent all of
					Tennessee. They deal with things like federal taxes, immigration, Social Security,
					and foreign policy.
				</p>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.federalReps as rep}
						<RepCard {rep} />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Search Again -->
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<h2 class="text-2xl font-bold text-civic-900 mb-4">Look up a different address</h2>
			<p class="text-gray-600 mb-8">
				Want to check who represents another neighborhood? Go for it.
			</p>
			<AddressSearch />
		</div>
	</section>
{/if}
