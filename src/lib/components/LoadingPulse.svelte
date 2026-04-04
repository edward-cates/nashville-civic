<script lang="ts">
	interface Props {
		lines?: number;
		label?: string;
	}

	let { lines = 3, label = 'Loading...' }: Props = $props();
</script>

<div class="animate-pulse space-y-3" role="status" aria-label={label}>
	<div class="flex items-center gap-2 mb-2">
		<div class="h-4 w-4 rounded-full bg-civic-200"></div>
		<span class="text-sm text-civic-600 font-medium">{label}</span>
	</div>
	{#each Array(lines) as _, i}
		<div class="h-3 rounded bg-gray-200" style="width: {85 - i * 15}%"></div>
	{/each}
</div>
