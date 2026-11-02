<script lang="ts">
	import { ExternalLink, MapPin, FileText, ChevronDown } from 'lucide-svelte';
	import {
		ELECTION,
		AMENDMENTS,
		AMENDMENT_PASSING_RULE,
		COUNTYWIDE_RACES,
		DISTRICT_RACES,
		LOCAL_MEASURES,
		SAMPLE_BALLOT_URL,
		AMENDMENTS_URL,
		POLLING_PLACE_URL,
		GOVOTETN_URL,
		VOTER_GUIDE_URL,
		arePollsClosed,
		type Race
	} from '$lib/ballot';

	const pollsClosed = arePollsClosed();

	function partyClass(party?: string): string {
		if (party === 'Republican') return 'text-red-700';
		if (party === 'Democrat') return 'text-blue-700';
		return 'text-gray-500';
	}

	function raceTitle(r: Race): string {
		return r.district ? `${r.office}, District ${r.district}` : r.office;
	}
</script>

{#snippet raceCard(race: Race)}
	<div class="bg-white rounded-xl border border-gray-200 p-5">
		<h4 class="font-semibold text-gray-900">{raceTitle(race)}</h4>
		{#if race.voteFor && race.voteFor > 1}
			<p class="text-xs text-gray-500 mt-0.5">Vote for {race.voteFor}</p>
		{/if}
		{#if race.candidates.length === 1}
			<p class="text-xs text-gray-500 mt-0.5">Unopposed</p>
		{/if}
		<ul class="mt-3 space-y-1.5 text-sm">
			{#each race.candidates as c}
				<li>
					<div class="flex justify-between gap-3">
						<span class="text-gray-800 {c.positions ? 'font-semibold' : ''}">{c.name}</span>
						{#if c.party}<span class="shrink-0 {partyClass(c.party)}">{c.party}</span>{/if}
					</div>
					{#if c.positions}
						<ul class="mt-1 mb-2 ml-4 list-disc space-y-0.5 text-gray-600">
							{#each c.positions as p}<li>{p}</li>{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
		{#if race.guideUrl}
			<a href={race.guideUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-civic-700 underline mt-3">
				Full comparison <ExternalLink class="h-3 w-3" />
			</a>
		{/if}
	</div>
{/snippet}

<section id="ballot" class="py-12 sm:py-16 bg-amber-50 border-b border-amber-100">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<p class="text-sm font-semibold uppercase tracking-wide text-amber-700">On the ballot</p>
		<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mt-1">{ELECTION.name}</h2>
		<p class="text-lg text-gray-700 mt-1">{ELECTION.dateLabel}</p>

		{#if pollsClosed}
			<p class="mt-4 text-gray-700">
				Polls have closed. Official results are posted by the
				<a href="https://www.nashville.gov/departments/election-commission" target="_blank" rel="noopener noreferrer" class="text-civic-700 underline">Davidson County Election Commission</a>.
			</p>
		{:else}
			<p class="mt-4 text-gray-700">
				Polls are open <strong>{ELECTION.hours}</strong> on election day. You must vote at your
				<strong>assigned</strong> polling place and bring a federal or Tennessee photo ID.
			</p>
		{/if}

		<div class="mt-5 flex flex-wrap gap-3">
			<a href={POLLING_PLACE_URL} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-civic-700 text-white text-sm font-semibold rounded-lg hover:bg-civic-800 transition-colors">
				<MapPin class="h-4 w-4" /> Find my polling place
			</a>
			<a href={GOVOTETN_URL} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg hover:border-civic-400 transition-colors">
				My personal sample ballot (GoVoteTN) <ExternalLink class="h-3.5 w-3.5" />
			</a>
			<a href={SAMPLE_BALLOT_URL} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg hover:border-civic-400 transition-colors">
				<FileText class="h-4 w-4" /> Official county sample ballot
			</a>
		</div>

		<!-- Amendments -->
		<h3 class="text-xl font-bold text-civic-900 mt-10">Three constitutional amendments</h3>
		<p class="text-gray-600 mt-2 text-sm leading-relaxed">
			Every Nashville voter sees these, on the first pages of the ballot next to the governor's race.
			{AMENDMENT_PASSING_RULE}
		</p>

		<div class="mt-5 space-y-4">
			{#each AMENDMENTS as a}
				<div class="bg-white rounded-xl border border-gray-200 p-6">
					<p class="text-xs font-semibold uppercase tracking-wide text-civic-600">Amendment {a.number}</p>
					<h4 class="text-lg font-semibold text-gray-900 mt-1">{a.title}</h4>
					<p class="text-gray-600 mt-2 leading-relaxed">{a.summary}</p>
					<div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
						<div class="rounded-lg bg-emerald-50 p-4">
							<p><span class="font-semibold text-emerald-800">Yes:</span> <span class="text-gray-700">{a.yesMeans}</span></p>
							<p class="font-semibold text-gray-800 mt-3">The case for</p>
							<p class="text-xs text-gray-500">{a.supporters.who}</p>
							<ul class="mt-1.5 ml-4 list-disc space-y-1 text-gray-700">
								{#each a.supporters.args as arg}<li>{arg}</li>{/each}
							</ul>
						</div>
						<div class="rounded-lg bg-gray-100 p-4">
							<p><span class="font-semibold text-gray-800">No:</span> <span class="text-gray-700">{a.noMeans}</span></p>
							<p class="font-semibold text-gray-800 mt-3">The case against</p>
							<p class="text-xs text-gray-500">{a.opponents.who}</p>
							<ul class="mt-1.5 ml-4 list-disc space-y-1 text-gray-700">
								{#each a.opponents.args as arg}<li>{arg}</li>{/each}
							</ul>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<p class="text-xs text-gray-500 mt-3">
			Plain-language summaries and arguments compiled by Nashville Civic from news coverage (Tennessee Lookout, WSMV, Axios, Nashville Scene); we don't take sides. Read the exact ballot wording at the
			<a href={AMENDMENTS_URL} target="_blank" rel="noopener noreferrer" class="underline">Tennessee Secretary of State</a>.
		</p>

		<!-- Countywide races -->
		<h3 class="text-xl font-bold text-civic-900 mt-10">On every Nashville ballot</h3>
		<div class="mt-4 grid sm:grid-cols-2 gap-4">
			{#each COUNTYWIDE_RACES as race}
				{@render raceCard(race)}
			{/each}
		</div>

		<!-- District races -->
		<h3 class="text-xl font-bold text-civic-900 mt-10">Depends on where you live</h3>
		<p class="text-gray-600 mt-2 text-sm">
			You'll see one U.S. House race and one TN House race, plus a TN Senate race if your district is up this year.
			Not sure of your districts? <a href="/your-nashville" class="text-civic-700 underline">Look up your reps</a> or check
			<a href={GOVOTETN_URL} target="_blank" rel="noopener noreferrer" class="text-civic-700 underline">GoVoteTN</a>.
			For state legislative candidates' positions, see the
			<a href={VOTER_GUIDE_URL} target="_blank" rel="noopener noreferrer" class="text-civic-700 underline">Tennessee Lookout voter guide</a>.
		</p>
		{#each DISTRICT_RACES as group}
			<details class="mt-4 group bg-white/60 rounded-xl border border-amber-100">
				<summary class="cursor-pointer list-none flex items-center justify-between px-5 py-4 font-semibold text-gray-900">
					{group.group}
					<ChevronDown class="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
				</summary>
				<div class="px-5 pb-5 grid sm:grid-cols-2 gap-4">
					{#each group.races as race}
						{@render raceCard(race)}
					{/each}
				</div>
			</details>
		{/each}

		{#each LOCAL_MEASURES as m}
			<div class="mt-6 bg-white rounded-xl border border-gray-200 p-5">
				<p class="text-xs font-semibold uppercase tracking-wide text-civic-600">{m.where}</p>
				<h4 class="font-semibold text-gray-900 mt-1">{m.title}</h4>
				<p class="text-sm text-gray-600 mt-2">{m.text}</p>
			</div>
		{/each}

		<p class="text-xs text-gray-500 mt-6">
			There are no Metro Nashville (mayor, council) races or Metro-wide referendums on this ballot. Next Metro election: August 2027.
		</p>
	</div>
</section>
