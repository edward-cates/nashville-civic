<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import { CalendarDays, FileText, Lightbulb, ArrowRight } from 'lucide-svelte';

	let { data } = $props();
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

<!-- This Week Section -->
{#if data.weeklyDigest}
	<section class="py-12 sm:py-16 bg-civic-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl sm:text-3xl font-bold text-civic-900 mb-6">This Week in Nashville</h2>
			<div class="bg-white rounded-xl shadow-sm border border-civic-100 p-6 sm:p-8">
				<div class="prose prose-lg prose-civic max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
					{data.weeklyDigest}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Upcoming Meetings Section -->
{#if data.meetings && data.meetings.length > 0}
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-8">
				<CalendarDays class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Upcoming Meetings</h2>
			</div>
			<div class="space-y-6">
				{#each data.meetings as meeting}
					<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
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
							<p class="text-gray-700 leading-relaxed mb-3">{meeting.summary}</p>
						{/if}
						<div class="flex flex-wrap gap-3 text-sm">
							{#if meeting.location}
								<span class="text-gray-500">{meeting.location}</span>
							{/if}
							{#if meeting.agendaUrl}
								<a
									href={meeting.agendaUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2"
								>
									View agenda
								</a>
							{/if}
							{#if meeting.videoUrl}
								<a
									href={meeting.videoUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="text-civic-700 hover:text-civic-900 font-medium underline underline-offset-2"
								>
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

<!-- Recent Legislation Section -->
{#if data.legislation && data.legislation.length > 0}
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-8">
				<FileText class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Recent Legislation</h2>
			</div>
			<div class="space-y-6">
				{#each data.legislation as item}
					<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						{#if item.summary}
							<p class="text-gray-800 text-lg leading-relaxed mb-3">{item.summary}</p>
						{/if}
						<div class="text-sm text-gray-500 space-y-1">
							<p>
								<span class="font-medium text-gray-600">{item.fileNumber}</span> &mdash; {item.title}
							</p>
							{#if item.statusExplained}
								<p class="text-civic-700 font-medium">{item.statusExplained}</p>
							{:else if item.status}
								<p class="text-gray-600">Status: {item.status}</p>
							{/if}
							{#if item.sponsors}
								<p>Sponsored by: {item.sponsors}</p>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Did You Know Section -->
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
				The mayor proposes the budget, but council has to approve it. That means your council member
				has a direct say in how Nashville spends money on schools, parks, police, and more.
			</p>
			<p>
				You can speak at most council and committee meetings. You get two minutes, and they actually
				have to listen. Seriously.
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
