<script lang="ts">
	import { CalendarDays, FileText, Newspaper } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>What's Happening in Nashville - Nashville Civic</title>
	<meta
		name="description"
		content="Your weekly digest of Nashville politics: upcoming meetings, recent legislation, and what it all means in plain language."
	/>
</svelte:head>

<!-- Header -->
<section class="bg-civic-900 text-white py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl sm:text-4xl font-bold mb-3">What's Happening in Nashville</h1>
		<p class="text-civic-200 text-lg leading-relaxed">
			Here's what's going on at Metro Council this week, explained in plain language. No jargon, no
			legalese, just what you need to know.
		</p>
	</div>
</section>

<!-- Weekly Digest -->
{#if data.weeklyDigest}
	<section class="py-12 sm:py-16 bg-civic-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-6">
				<Newspaper class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">The Week at a Glance</h2>
			</div>
			<div class="bg-white rounded-xl shadow-sm border border-civic-100 p-6 sm:p-8">
				<div class="prose prose-lg prose-civic max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
					{data.weeklyDigest}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Upcoming Meetings -->
{#if data.meetings && data.meetings.length > 0}
	<section class="py-12 sm:py-16">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-4">
				<CalendarDays class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Upcoming Meetings</h2>
			</div>
			<p class="text-gray-600 text-lg mb-8 leading-relaxed">
				These are meetings where Nashville's government does its work. Most are open to the public,
				and many let you speak during public comment. Show up, or at least know what they're deciding.
			</p>
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

<!-- Recent Legislation -->
{#if data.legislation && data.legislation.length > 0}
	<section class="py-12 sm:py-16 bg-gray-50">
		<div class="max-w-3xl mx-auto px-4 sm:px-6">
			<div class="flex items-center gap-3 mb-4">
				<FileText class="h-7 w-7 text-civic-700" />
				<h2 class="text-2xl sm:text-3xl font-bold text-civic-900">Recent Legislation</h2>
			</div>
			<p class="text-gray-600 text-lg mb-8 leading-relaxed">
				These are bills, ordinances, and resolutions that Metro Council is working on right now.
				We've translated each one from government-speak into plain English.
			</p>
			<div class="space-y-6">
				{#each data.legislation as item}
					<article class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						{#if item.summary}
							<p class="text-gray-800 text-lg leading-relaxed mb-3">{item.summary}</p>
						{/if}
						<div class="text-sm text-gray-500 space-y-1.5">
							<p>
								<span class="font-medium text-gray-600">{item.fileNumber}</span>
								{#if item.type}
									<span
										class="ml-2 inline-block px-2 py-0.5 bg-civic-50 text-civic-700 rounded text-xs font-medium"
									>
										{item.type}
									</span>
								{/if}
							</p>
							<p class="text-gray-600">{item.title}</p>
							{#if item.statusExplained}
								<p class="text-civic-700 font-medium">{item.statusExplained}</p>
							{:else if item.status}
								<p class="text-gray-600">Status: {item.status}</p>
							{/if}
							{#if item.sponsors}
								<p>Sponsored by: {item.sponsors}</p>
							{/if}
							{#if item.introDate}
								<p>
									Introduced: {new Date(item.introDate).toLocaleDateString('en-US', {
										month: 'long',
										day: 'numeric',
										year: 'numeric'
									})}
								</p>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- No data fallback -->
{#if (!data.meetings || data.meetings.length === 0) && (!data.legislation || data.legislation.length === 0) && !data.weeklyDigest}
	<section class="py-16 sm:py-24">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<p class="text-gray-500 text-lg">
				We're still loading data from Metro Council. Check back in a few minutes.
			</p>
		</div>
	</section>
{/if}
