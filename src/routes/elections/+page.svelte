<script lang="ts">
	import { Vote, CalendarCheck, MapPin, ClipboardCheck, ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Elections & Voting — Nashville Civic</title>
	<meta name="description" content="Everything you need to vote in Nashville — registration, polling locations, what's on your ballot, and upcoming election dates." />
</svelte:head>

<section class="bg-civic-900 text-white py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl sm:text-4xl font-bold mb-3">Elections & Voting</h1>
		<p class="text-civic-200 text-lg leading-relaxed">
			Everything you need to participate. Registration, polling locations, what's on your ballot, and when it all happens.
		</p>
	</div>
</section>

<!-- Quick Actions -->
<section class="py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<div class="grid sm:grid-cols-2 gap-4">
			<a
				href="https://tnmap.tn.gov/voterlookup/"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-civic-300 transition-all group"
			>
				<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-civic-200 transition-colors">
					<ClipboardCheck class="h-5 w-5 text-civic-700" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 group-hover:text-civic-800 transition-colors">Check Your Registration</h3>
					<p class="text-sm text-gray-600 mt-1">Make sure you're registered to vote in Tennessee. Takes 30 seconds.</p>
					<span class="inline-flex items-center gap-1 text-xs text-civic-600 mt-2">tnmap.tn.gov <ExternalLink class="h-3 w-3" /></span>
				</div>
			</a>

			<a
				href="https://tnmap.tn.gov/voterlookup/"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-civic-300 transition-all group"
			>
				<div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
					<MapPin class="h-5 w-5 text-emerald-700" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 group-hover:text-civic-800 transition-colors">Find Your Polling Place</h3>
					<p class="text-sm text-gray-600 mt-1">Look up exactly where you go to vote on election day.</p>
					<span class="inline-flex items-center gap-1 text-xs text-civic-600 mt-2">tnmap.tn.gov <ExternalLink class="h-3 w-3" /></span>
				</div>
			</a>

			<a
				href="https://ovr.govote.tn.gov/"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-civic-300 transition-all group"
			>
				<div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
					<Vote class="h-5 w-5 text-amber-700" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 group-hover:text-civic-800 transition-colors">Register to Vote</h3>
					<p class="text-sm text-gray-600 mt-1">Not registered yet? Tennessee lets you register online. You need to register at least 30 days before an election.</p>
					<span class="inline-flex items-center gap-1 text-xs text-civic-600 mt-2">govote.tn.gov <ExternalLink class="h-3 w-3" /></span>
				</div>
			</a>

			<a
				href="https://www.nashville.gov/departments/election-commission"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-civic-300 transition-all group"
			>
				<div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
					<CalendarCheck class="h-5 w-5 text-purple-700" />
				</div>
				<div>
					<h3 class="font-semibold text-gray-900 group-hover:text-civic-800 transition-colors">Davidson County Election Commission</h3>
					<p class="text-sm text-gray-600 mt-1">Official source for Nashville/Davidson County election dates, sample ballots, and early voting info.</p>
					<span class="inline-flex items-center gap-1 text-xs text-civic-600 mt-2">nashville.gov <ExternalLink class="h-3 w-3" /></span>
				</div>
			</a>
		</div>
	</div>
</section>

<!-- How Nashville Elections Work -->
<section class="py-12 sm:py-16 bg-gray-50">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<h2 class="text-2xl font-bold text-civic-900 mb-8">How Nashville Elections Work</h2>

		<div class="space-y-6">
			<div class="bg-white rounded-xl border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-900 text-lg mb-2">Who do you vote for?</h3>
				<p class="text-gray-600 leading-relaxed">
					As a Nashville resident, you vote for a <strong>lot</strong> of people:
				</p>
				<ul class="mt-3 space-y-2 text-gray-600">
					<li class="flex gap-2"><span class="text-civic-600 font-bold">Local:</span> Mayor, your Metro Council district member, 5 at-large council members</li>
					<li class="flex gap-2"><span class="text-amber-600 font-bold">State:</span> Governor, your TN State Senator, your TN State Representative</li>
					<li class="flex gap-2"><span class="text-civic-800 font-bold">Federal:</span> President, your U.S. House representative, 2 U.S. Senators</li>
				</ul>
				<p class="text-gray-600 mt-3 leading-relaxed">
					Not all of these are on every ballot — different offices have different election cycles.
				</p>
			</div>

			<div class="bg-white rounded-xl border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-900 text-lg mb-2">When are elections?</h3>
				<div class="space-y-3 text-gray-600">
					<p><strong>Metro Council & Mayor:</strong> Every 4 years. Current term is 2023–2027. Next Nashville election: <strong>August 2027</strong>.</p>
					<p><strong>State legislature:</strong> State House members every 2 years, State Senators every 4. Next state election: <strong>November 2026</strong>.</p>
					<p><strong>Federal:</strong> U.S. House every 2 years, U.S. Senate every 6 (staggered). Next federal election: <strong>November 2026</strong>.</p>
					<p><strong>Presidential:</strong> Every 4 years. Next: <strong>November 2028</strong>.</p>
				</div>
			</div>

			<div class="bg-white rounded-xl border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-900 text-lg mb-2">Early voting & absentee</h3>
				<p class="text-gray-600 leading-relaxed">
					Tennessee has <strong>early voting</strong> — you can vote in person at any early voting location in Davidson County, usually starting about 2 weeks before election day. You don't need a reason.
				</p>
				<p class="text-gray-600 leading-relaxed mt-3">
					<strong>Absentee voting</strong> (mail-in) is available if you'll be out of the county on election day, are 60+ years old, disabled, hospitalized, or a caretaker of a hospitalized person. You need to request an absentee ballot in advance.
				</p>
			</div>

			<div class="bg-white rounded-xl border border-gray-100 p-6">
				<h3 class="font-semibold text-gray-900 text-lg mb-2">What do you need to vote?</h3>
				<p class="text-gray-600 leading-relaxed">
					Tennessee requires <strong>photo ID</strong> to vote. Accepted IDs include: Tennessee driver's license, U.S. passport, TN handgun carry permit, or a free photo ID from the county election commission. Student IDs are <strong>not</strong> accepted.
				</p>
				<p class="text-gray-600 leading-relaxed mt-3">
					Don't have an ID? The Davidson County Election Commission will issue one for free. Call <a href="tel:6158626787" class="text-civic-700 underline">(615) 862-6787</a>.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Find Your Reps -->
<section class="py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
		<h2 class="text-2xl font-bold text-civic-900 mb-4">Know who's on your ballot</h2>
		<p class="text-gray-600 text-lg mb-6">
			Look up your address to see everyone who currently represents you — so you know who you'll be voting for (or against) next time.
		</p>
		<a
			href="/your-nashville"
			class="inline-flex items-center gap-2 px-6 py-3 bg-civic-700 text-white font-semibold rounded-lg hover:bg-civic-800 transition-colors"
		>
			Find my representatives
		</a>
	</div>
</section>
