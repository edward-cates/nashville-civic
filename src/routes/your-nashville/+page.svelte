<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import RepCard from '$lib/components/RepCard.svelte';
	import { MapPin, Phone, Mail, Globe, Building2, Landmark, Users, FileText, Flame, ExternalLink, Briefcase } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/markdown';

	function barColor(score: number): string {
		if (score >= 7) return 'bg-red-500';
		if (score >= 4) return 'bg-amber-400';
		return 'bg-gray-300';
	}

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
	<!-- Default view: Nashville-wide reps -->
	<section class="bg-civic-900 text-white py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<h1 class="text-3xl sm:text-4xl font-bold mb-3">Who Represents Nashville?</h1>
			<p class="text-civic-200 text-lg leading-relaxed mb-8">
				These leaders represent everyone in Nashville. Enter your address below to also see your specific district council member, state legislators, and U.S. House rep.
			</p>
			<AddressSearch />
		</div>
	</section>

	<!-- Mayor -->
	{#if data.mayor}
		<section class="py-12 sm:py-16">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-6">
					<Landmark class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl font-bold text-civic-900">The Mayor</h2>
				</div>
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<p class="text-xl font-bold text-gray-900">{data.mayor.name}</p>
					<p class="text-gray-600 text-sm mb-3">{data.mayor.office} · {data.mayor.party}</p>
					<p class="text-gray-600 leading-relaxed mb-4">
						The mayor runs Nashville's day-to-day government, proposes the city budget, and manages all Metro departments. While your council member votes on laws, the mayor decides how they get carried out.
					</p>
					<div class="flex flex-wrap gap-3 text-sm">
						<a href="tel:{data.mayor.phone}" class="text-civic-700 hover:text-civic-900 underline underline-offset-2">{data.mayor.phone}</a>
						<a href="mailto:{data.mayor.email}" class="text-civic-700 hover:text-civic-900 underline underline-offset-2">{data.mayor.email}</a>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Governor -->
	{#if data.stateReps && data.stateReps.length > 0}
		<section class="py-12 sm:py-16 bg-gray-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-4">
					<Users class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl font-bold text-civic-900">State Leadership</h2>
				</div>
				<p class="text-gray-600 text-lg mb-6 leading-relaxed">
					The governor and state legislature make decisions about education, healthcare, gun laws, and taxes that affect Nashville — sometimes overriding what the city wants.
				</p>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.stateReps as rep}
						<RepCard {rep} />
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Prompt for address -->
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<h2 class="text-2xl font-bold text-civic-900 mb-3">Want to see your full team?</h2>
			<p class="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
				Enter your address to see your specific Metro Council member, TN state senator and representative, and U.S. House rep.
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

					<!-- Committees -->
					{#if data.localRepCommittees && data.localRepCommittees.length > 0}
						<div class="mt-6 pt-6 border-t border-civic-700">
							<div class="flex items-center gap-2 mb-3">
								<Briefcase class="h-4 w-4 text-civic-300" />
								<h3 class="text-sm font-semibold text-civic-200 uppercase tracking-wider">Committee Seats</h3>
							</div>
							<p class="text-civic-300 text-sm mb-3">
								Committees are where the real work happens. These are the topics your council member has direct influence over.
							</p>
							<div class="flex flex-wrap gap-2">
								{#each data.localRepCommittees as committee}
									<span class="text-sm bg-civic-700/60 text-civic-100 rounded-lg px-3 py-1.5">
										{committee.name}
										{#if committee.title !== 'Member'}
											<span class="text-civic-400">· {committee.title}</span>
										{/if}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Sponsored Bills -->
					{#if data.localRepBills && data.localRepBills.length > 0}
						<div class="mt-6 pt-6 border-t border-civic-700">
							<div class="flex items-center gap-2 mb-3">
								<FileText class="h-4 w-4 text-civic-300" />
								<h3 class="text-sm font-semibold text-civic-200 uppercase tracking-wider">Bills They've Sponsored</h3>
							</div>
							<p class="text-civic-300 text-sm mb-4">
								These are things your council member has personally proposed or co-sponsored. It tells you what they care about.
							</p>
							<div class="space-y-3">
								{#each data.localRepBills as bill}
									<div class="bg-civic-800/60 rounded-lg p-4 {bill.controversyScore >= 7 ? 'border border-amber-500/30' : ''}">
										<div class="flex items-start justify-between gap-2 mb-1">
											<div>
												{#if bill.summary}
													<p class="text-civic-50 text-sm leading-relaxed">{bill.summary}</p>
												{:else}
													<p class="text-civic-50 text-sm leading-relaxed">{bill.title}</p>
												{/if}
											</div>
											{#if bill.controversyScore >= 7}
												<Flame class="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
											{/if}
										</div>
										{#if bill.tension}
											<p class="text-civic-300 text-xs italic mt-2 leading-relaxed border-l-2 border-civic-600 pl-2">{bill.tension}</p>
										{/if}
										<div class="flex items-center justify-between mt-2">
											<span class="text-civic-400 text-xs">{bill.fileNumber} · {bill.status}</span>
											{#if bill.controversyScore > 0}
												<div class="flex items-center gap-1.5">
													<div class="w-12 h-1 bg-civic-700 rounded-full overflow-hidden">
														<div class="{barColor(bill.controversyScore)} h-full rounded-full" style="width: {bill.controversyScore * 10}%"></div>
													</div>
													<span class="text-xs text-civic-400">{bill.controversyScore}/10</span>
												</div>
											{/if}
										</div>
										<a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer"
											class="inline-flex items-center gap-1 text-xs text-civic-300 hover:text-civic-100 mt-1.5 transition-colors">
											Official record <ExternalLink class="h-3 w-3" />
										</a>
									</div>
								{/each}
							</div>
							<a href="/legislation" class="inline-block mt-4 text-sm text-civic-300 hover:text-white underline underline-offset-2 transition-colors">
								See all Nashville legislation →
							</a>
						</div>
					{/if}
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

				<!-- State rep bills -->
				{#if data.stateRepBills && data.stateRepBills.length > 0}
					<div class="mt-8 pt-8 border-t border-gray-200">
						<div class="flex items-center gap-2 mb-3">
							<FileText class="h-5 w-5 text-amber-600" />
							<h3 class="text-lg font-semibold text-gray-900">Bills Your State Reps Are Working On</h3>
						</div>
						<p class="text-gray-600 text-sm mb-4">
							These are bills your Tennessee state legislators have sponsored or co-sponsored. State laws override city laws — what happens here directly affects Nashville.
						</p>
						<div class="space-y-3">
							{#each data.stateRepBills as bill}
								<div class="bg-white rounded-lg border {bill.controversyScore >= 7 ? 'border-amber-200' : 'border-gray-100'} p-4">
									<div class="flex items-start justify-between gap-2 mb-1">
										<div>
											{#if bill.summary}
												<p class="text-sm text-gray-800 leading-relaxed">{bill.summary}</p>
											{:else}
												<p class="text-sm text-gray-800 leading-relaxed">{bill.title}</p>
											{/if}
										</div>
										{#if bill.controversyScore >= 7}
											<Flame class="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
										{/if}
									</div>
									{#if bill.tension}
										<p class="text-xs italic text-gray-500 mt-2 leading-relaxed border-l-2 {bill.controversyScore >= 7 ? 'border-amber-400' : 'border-gray-200'} pl-2">{bill.tension}</p>
									{/if}
									<div class="flex items-center justify-between mt-2">
										<span class="text-xs text-gray-400">{bill.fileNumber} · {bill.status}</span>
										{#if bill.controversyScore > 0}
											<div class="flex items-center gap-1.5">
												<div class="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
													<div class="{barColor(bill.controversyScore)} h-full rounded-full" style="width: {bill.controversyScore * 10}%"></div>
												</div>
												<span class="text-xs text-gray-400">{bill.controversyScore}/10</span>
											</div>
										{/if}
									</div>
									<a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer"
										class="inline-flex items-center gap-1 text-xs text-civic-700 hover:text-civic-900 mt-1.5 transition-colors">
										Official record <ExternalLink class="h-3 w-3" />
									</a>
								</div>
							{/each}
						</div>
						<a href="/legislation?level=state" class="inline-block mt-4 text-sm text-civic-700 hover:text-civic-900 underline underline-offset-2 transition-colors">
							See all Tennessee legislation →
						</a>
					</div>
				{/if}
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
