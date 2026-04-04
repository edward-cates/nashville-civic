<script lang="ts">
	import { page } from '$app/state';
	import { Landmark, Menu, X } from 'lucide-svelte';

	let mobileOpen = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/your-nashville', label: 'My Reps' },
		{ href: '/whats-happening', label: "What's Happening" },
		{ href: '/legislation', label: 'Bills' },
		{ href: '/elections', label: 'Elections' },
		{ href: '/contact', label: 'Contact' },
		{ href: '/how-it-works', label: 'How It Works' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="bg-white border-b border-gray-200">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="flex items-center justify-between h-16">
			<a href="/" class="flex items-center gap-2 text-civic-800 font-bold text-xl">
				<Landmark class="h-6 w-6" />
				Nashville Civic
			</a>

			<!-- Desktop nav -->
			<div class="hidden sm:flex items-center gap-1">
				{#each links as link}
					<a
						href={link.href}
						class="px-3 py-2 rounded-md text-sm font-medium transition-colors {isActive(link.href)
							? 'bg-civic-50 text-civic-800'
							: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Mobile menu button -->
			<button
				onclick={() => { mobileOpen = !mobileOpen; }}
				class="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
				aria-label="Toggle menu"
			>
				{#if mobileOpen}
					<X class="h-6 w-6" />
				{:else}
					<Menu class="h-6 w-6" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile nav -->
	{#if mobileOpen}
		<div class="sm:hidden border-t border-gray-200 bg-white">
			<div class="px-4 py-2 space-y-1">
				{#each links as link}
					<a
						href={link.href}
						onclick={() => { mobileOpen = false; }}
						class="block px-3 py-2 rounded-md text-base font-medium transition-colors {isActive(link.href)
							? 'bg-civic-50 text-civic-800'
							: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
					>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
