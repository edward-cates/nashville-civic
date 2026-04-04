<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<Nav />

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="bg-gray-50 border-t border-gray-200 py-8 mt-12">
		<div class="max-w-5xl mx-auto px-4 sm:px-6">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
				<p>Nashville Civic — Making local politics accessible.</p>
				<div class="flex gap-4">
					<a href="/about" class="hover:text-gray-700 transition-colors">About</a>
					<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700 transition-colors">GitHub</a>
				</div>
			</div>
			<p class="mt-4 text-xs text-gray-400 text-center sm:text-left">
				Open source. Non-partisan. No tracking. No ads.
			</p>
		</div>
	</footer>
</div>
