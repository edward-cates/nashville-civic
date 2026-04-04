<script lang="ts">
	import { Calendar, MapPin, FileText, Video } from 'lucide-svelte';

	interface Props {
		bodyName: string;
		date: string;
		time: string;
		location: string;
		agendaUrl?: string;
		videoUrl?: string;
		insiteUrl?: string;
	}

	let { bodyName, date, time, location, agendaUrl, videoUrl, insiteUrl }: Props = $props();

	const formattedDate = new Date(date).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
	<h3 class="text-lg font-semibold text-gray-900">{bodyName}</h3>

	<div class="mt-2 space-y-1.5">
		<div class="flex items-center gap-2 text-sm text-gray-600">
			<Calendar class="h-4 w-4 shrink-0" />
			<span>{formattedDate} at {time}</span>
		</div>
		{#if location}
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<MapPin class="h-4 w-4 shrink-0" />
				<span>{location}</span>
			</div>
		{/if}
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		{#if agendaUrl}
			<a
				href={agendaUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-civic-700 bg-civic-50 rounded-md hover:bg-civic-100 transition-colors"
			>
				<FileText class="h-4 w-4" />
				View Agenda
			</a>
		{/if}
		{#if videoUrl || insiteUrl}
			<a
				href={videoUrl || insiteUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
			>
				<Video class="h-4 w-4" />
				Watch
			</a>
		{/if}
	</div>
</div>
