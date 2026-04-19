<script lang="ts">
	import { onMount } from 'svelte';
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import StoryCarousel from '$lib/components/StoryCarousel.svelte';
	import TopicList from '$lib/components/TopicList.svelte';
	import LoadingPulse from '$lib/components/LoadingPulse.svelte';
	import { CalendarDays, Lightbulb, ArrowRight } from 'lucide-svelte';

	// Initialize to a never-resolving promise so the SSR render shows the loading skeleton;
	// replace with the real fetch once we're in the browser (relative URLs can't be fetched during SSR).
	let homeData = $state<Promise<{ meetings: any[]; legislation: any[]; storyCards: any[] }>>(
		new Promise(() => {})
	);

	onMount(() => {
		homeData = fetch('/api/home').then(r => r.json());
	});
</script>

<svelte:head>
	<title>Nashville Civic - Know Your Government</title>
	<meta
		name="description"
		content="Find out who represents you in Nashville. Understand what's happening at Metro Council. Make your voice heard."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-civic-900 text-white py-16 sm:py-24">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
		<h1 class="text-3xl sm:text-5xl font-bold leading-tight mb-6">
			45 people represent you in Nashville.<br />
			<span class="text-civic-300">Do you know any of them?</span>
		</h1>
		<p class="text-lg sm:text-xl text-civic-200 max-w-2xl mx-auto mb-10 leading-relaxed">
			Your Metro Council member decides what gets built in your neighborhood, how your tax dollars
			get spent, and whether that pothole on your street gets fixed. Let's find out who they are.
		</p>
		<AddressSearch />
		<p class="mt-4 text-sm text-civic-400">
			Your address is only used to look up your representatives. We never store it.
		</p>
	</div>
</section>

<!-- Dynamic content — fetched client-side so page shell renders instantly -->
{#await homeData}
	<!-- Story Cards skeleton -->
	<section class="py-12 sm:py-16 bg-civic-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-6">This Week in Nashville</h2>
			<LoadingPulse lines={4} label="Catching up on this week..." />
		</div>
	</section>

	<!-- Topics skeleton -->
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-8">By Topic</h2>
			<div class="space-y-3">
				{#each Array(4) as _}
					<div class="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
						<LoadingPulse lines={2} label="Summarizing legislation..." />
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Meetings skeleton -->
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-8">
				<CalendarDays class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Meetings This Week</h2>
			</div>
			<div class="space-y-6">
				{#each Array(3) as _}
					<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<LoadingPulse lines={3} label="Loading meetings..." />
					</div>
				{/each}
			</div>
		</div>
	</section>
{:then home}
	{#if home.storyCards && home.storyCards.length > 0}
		<section class="py-12 sm:py-16 bg-civic-50">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-6">This Week in Nashville</h2>
				<StoryCarousel cards={home.storyCards} />
			</div>
		</section>
	{/if}

	<TopicList legislation={home.legislation} />

	{#if home.meetings && home.meetings.length > 0}
		<section class="py-12 sm:py-16">
			<div class="max-w-3xl mx-auto px-4 sm:px-6">
				<div class="flex items-center gap-3 mb-8">
					<CalendarDays class="h-7 w-7 text-civic-700" />
					<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Meetings This Week</h2>
				</div>
				<div class="space-y-6">
					{#each home.meetings as meeting}
						<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
								<h3 class="text-lg font-semibold text-civic-800">{meeting.body}</h3>
								<time class="text-sm text-gray-500">
									{new Date(meeting.date).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric'
									})} at {meeting.time}
								</time>
							</div>
							{#if meeting.summary}
								<p class="text-gray-600 text-sm mb-4">{meeting.summary}</p>
							{/if}

							{#if meeting.issues && meeting.issues.length > 0}
								<div class="space-y-2 mb-4">
									{#each meeting.issues as issue}
										<div class="pl-3 border-l-2 {issue.interestLevel === 'high' ? 'border-amber-500' : 'border-gray-200'}">
											<p class="text-sm font-semibold text-gray-800">{issue.title}</p>
											<p class="text-sm text-gray-600">{issue.summary}</p>
											{#if issue.tension}
												<p class="text-sm italic text-gray-500 mt-0.5">{issue.tension}</p>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							<div class="flex flex-wrap gap-3 text-sm">
								{#if meeting.location}
									<span class="text-gray-500">{meeting.location}</span>
								{/if}
								{#if meeting.agendaUrl}
									<a href={meeting.agendaUrl} target="_blank" rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2">
										View agenda
									</a>
								{/if}
								{#if meeting.videoUrl}
									<a href={meeting.videoUrl} target="_blank" rel="noopener noreferrer"
										class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2">
										Watch video
									</a>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/if}
{/await}

<!-- Did You Know -->
<section class="py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<div class="flex items-center gap-3 mb-8">
			<Lightbulb class="h-7 w-7 text-civic-700" />
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Did You Know?</h2>
		</div>
		<div class="space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				Nashville has a consolidated city-county government, meaning Metro Council handles both city
				and county business. It's been that way since 1963.
			</p>
			<p>
				There are 40 council members total: 35 represent specific districts (like yours), and 5 are
				"at-large" members who represent all of Nashville.
			</p>
			<p>
				You can speak at most council and committee meetings. You get two minutes, and they actually
				have to listen.
			</p>
		</div>
		<div class="mt-8">
			<a
				href="/how-it-works"
				class="inline-flex items-center gap-2 text-civic-700 hover:text-civic-900 font-semibold text-lg underline underline-offset-4"
			>
				Learn how Nashville's government works
				<ArrowRight class="h-5 w-5" />
			</a>
		</div>
	</div>
</section>
