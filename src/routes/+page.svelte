<script lang="ts">
	import AddressSearch from '$lib/components/AddressSearch.svelte';
	import MeetingCard from '$lib/components/MeetingCard.svelte';
	import { Landmark, Users, FileText, Mail } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Nashville Civic — Know Your Local Government</title>
</svelte:head>

<!-- Hero -->
<section class="bg-civic-900 text-white py-16 sm:py-24">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
		<h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
			Your city. Your voice.
		</h1>
		<p class="mt-4 text-lg sm:text-xl text-civic-200 max-w-2xl mx-auto">
			Find your Nashville representatives, see what they're voting on, and make your voice heard. It takes 2 minutes.
		</p>
		<div class="mt-8">
			<AddressSearch />
		</div>
	</div>
</section>

<!-- Features -->
<section class="py-12 sm:py-16">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="text-center p-6">
				<div class="w-12 h-12 bg-civic-100 rounded-lg flex items-center justify-center mx-auto">
					<Users class="h-6 w-6 text-civic-700" />
				</div>
				<h3 class="mt-3 font-semibold text-gray-900">Find Your Reps</h3>
				<p class="mt-1 text-sm text-gray-600">From Metro Council to Congress — everyone who represents you.</p>
			</div>
			<div class="text-center p-6">
				<div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto">
					<Mail class="h-6 w-6 text-emerald-700" />
				</div>
				<h3 class="mt-3 font-semibold text-gray-900">Contact Them</h3>
				<p class="mt-1 text-sm text-gray-600">One-click email and phone. Make it easy to be heard.</p>
			</div>
			<div class="text-center p-6">
				<div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto">
					<Landmark class="h-6 w-6 text-amber-700" />
				</div>
				<h3 class="mt-3 font-semibold text-gray-900">Council Meetings</h3>
				<p class="mt-1 text-sm text-gray-600">See what's on the agenda before they vote on it.</p>
			</div>
			<div class="text-center p-6">
				<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
					<FileText class="h-6 w-6 text-purple-700" />
				</div>
				<h3 class="mt-3 font-semibold text-gray-900">Track Legislation</h3>
				<p class="mt-1 text-sm text-gray-600">Bills, ordinances, resolutions — searchable and clear.</p>
			</div>
		</div>
	</div>
</section>

<!-- Upcoming Meetings -->
{#if data.meetings.length > 0}
	<section class="py-12 bg-gray-50">
		<div class="max-w-5xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Upcoming Council Meetings</h2>
			<div class="grid sm:grid-cols-2 gap-4">
				{#each data.meetings as meeting}
					<MeetingCard
						bodyName={meeting.EventBodyName}
						date={meeting.EventDate}
						time={meeting.EventTime}
						location={meeting.EventLocation}
						agendaUrl={meeting.EventAgendaFile || undefined}
						videoUrl={meeting.EventVideoPath || undefined}
						insiteUrl={meeting.EventInSiteURL || undefined}
					/>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- Recent Legislation -->
{#if data.legislation.length > 0}
	<section class="py-12">
		<div class="max-w-5xl mx-auto px-4 sm:px-6">
			<h2 class="text-2xl font-bold text-gray-900 mb-6">Recent Legislation</h2>
			<div class="space-y-3">
				{#each data.legislation as matter}
					<div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
						<div class="flex items-start justify-between gap-3">
							<div>
								<span class="text-xs font-mono text-gray-500">{matter.MatterFile}</span>
								<h3 class="text-sm font-semibold text-gray-900 mt-0.5">
									{matter.MatterTitle || matter.MatterName}
								</h3>
							</div>
							<span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
								{matter.MatterStatusName || matter.MatterTypeName}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
