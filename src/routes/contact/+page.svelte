<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
	import { page } from '$app/state';
	import { Mail, Phone } from 'lucide-svelte';

	const repName = page.url.searchParams.get('rep') || '';
	const repEmail = page.url.searchParams.get('email') || '';
	const repLevel = page.url.searchParams.get('level') || 'local';
</script>

<svelte:head>
	<title>Contact Your Rep — Nashville Civic</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	<h1 class="text-3xl font-bold text-gray-900">Contact Your Representative</h1>
	<p class="mt-2 text-gray-600">
		Your elected officials work for you. Let them know what matters to you.
	</p>

	{#if repName && repEmail}
		<div class="mt-8">
			<ContactForm
				representativeName={repName}
				representativeEmail={repEmail}
				representativeLevel={repLevel}
			/>
		</div>
	{:else}
		<div class="mt-8 space-y-6">
			<div class="bg-amber-50 border border-amber-200 rounded-lg p-6">
				<p class="text-amber-800">
					To send a message, first <a href="/" class="font-semibold underline hover:text-amber-900">find your representatives</a>
					and click "Send Message" on their card.
				</p>
			</div>

			<div class="border border-gray-200 rounded-lg p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Contacts</h2>
				<div class="space-y-4">
					<div>
						<h3 class="font-medium text-gray-900">Nashville Mayor's Office</h3>
						<div class="mt-1 flex flex-wrap gap-3 text-sm">
							<a href="tel:6158626000" class="inline-flex items-center gap-1 text-civic-700 hover:text-civic-800">
								<Phone class="h-4 w-4" /> (615) 862-6000
							</a>
							<a href="mailto:mayor@nashville.gov" class="inline-flex items-center gap-1 text-civic-700 hover:text-civic-800">
								<Mail class="h-4 w-4" /> mayor@nashville.gov
							</a>
						</div>
					</div>
					<div>
						<h3 class="font-medium text-gray-900">Metropolitan Clerk's Office</h3>
						<div class="mt-1 flex flex-wrap gap-3 text-sm">
							<a href="tel:6158626770" class="inline-flex items-center gap-1 text-civic-700 hover:text-civic-800">
								<Phone class="h-4 w-4" /> (615) 862-6770
							</a>
							<a href="mailto:metroclerk@nashville.gov" class="inline-flex items-center gap-1 text-civic-700 hover:text-civic-800">
								<Mail class="h-4 w-4" /> metroclerk@nashville.gov
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
