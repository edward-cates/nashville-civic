<script lang="ts">
	import { goto } from '$app/navigation';
	import { MapPin, Search } from 'lucide-svelte';

	let address = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!address.trim()) return;
		loading = true;
		goto(`/representatives?address=${encodeURIComponent(address.trim())}`);
	}
</script>

<form onsubmit={handleSubmit} class="w-full max-w-2xl mx-auto">
	<label for="address-input" class="block text-sm font-medium text-gray-700 mb-2">
		Enter your Nashville address
	</label>
	<div class="relative flex gap-2">
		<div class="relative flex-1">
			<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
			<input
				id="address-input"
				type="text"
				bind:value={address}
				placeholder="123 Broadway, Nashville, TN"
				class="w-full pl-11 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
				required
			/>
		</div>
		<button
			type="submit"
			disabled={loading || !address.trim()}
			class="px-6 py-3 bg-civic-700 text-white font-semibold rounded-lg hover:bg-civic-800 focus:outline-none focus:ring-2 focus:ring-civic-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
		>
			<Search class="h-5 w-5" />
			<span class="hidden sm:inline">Find My Reps</span>
		</button>
	</div>
	<p class="mt-2 text-sm text-gray-500">
		We use your address only to look up your representatives. Nothing is stored.
	</p>
</form>
