<script lang="ts">
	import { enhance } from '$app/forms';
	import { Send, CheckCircle, AlertCircle } from 'lucide-svelte';

	interface Props {
		representativeName: string;
		representativeEmail: string;
		representativeLevel: string;
		initialSubject?: string;
		initialMessage?: string;
	}

	let {
		representativeName,
		representativeEmail,
		representativeLevel,
		initialSubject = '',
		initialMessage = ''
	}: Props = $props();

	let status = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
	let errorMessage = $state('');
	let mailtoFallback = $state('');
</script>

{#if status === 'sent'}
	<div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
		<CheckCircle class="h-12 w-12 text-emerald-600 mx-auto mb-3" />
		<h3 class="text-lg font-semibold text-emerald-800">Message Sent</h3>
		<p class="text-emerald-700 mt-1">
			Your message to {representativeName} has been sent. Thank you for being an engaged citizen.
		</p>
		<button
			onclick={() => { status = 'idle'; }}
			class="mt-4 text-sm text-emerald-700 underline hover:text-emerald-800"
		>
			Send another message
		</button>
	</div>
{:else}
	<form
		method="POST"
		action="/contact"
		use:enhance={() => {
			status = 'sending';
			return async ({ result }) => {
				if (result.type === 'success') {
					const data = result.data as { success?: boolean; mailtoFallback?: string; error?: string };
					if (data?.mailtoFallback) {
						mailtoFallback = data.mailtoFallback;
						status = 'idle';
					} else if (data?.success) {
						status = 'sent';
					} else {
						errorMessage = data?.error || 'Something went wrong.';
						status = 'error';
					}
				} else {
					errorMessage = 'Something went wrong. Please try again.';
					status = 'error';
				}
			};
		}}
		class="space-y-4"
	>
		<input type="hidden" name="representativeName" value={representativeName} />
		<input type="hidden" name="representativeEmail" value={representativeEmail} />
		<input type="hidden" name="representativeLevel" value={representativeLevel} />

		<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
			<p class="text-sm text-gray-600">
				Sending to: <span class="font-semibold text-gray-900">{representativeName}</span>
				{#if representativeEmail}
					<span class="text-gray-400">({representativeEmail})</span>
				{/if}
			</p>
		</div>

		<div>
			<label for="senderName" class="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
			<input
				id="senderName"
				name="senderName"
				type="text"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
				placeholder="Your full name"
			/>
		</div>

		<div>
			<label for="senderEmail" class="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
			<input
				id="senderEmail"
				name="senderEmail"
				type="email"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
				placeholder="you@example.com"
			/>
		</div>

		<div>
			<label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
			<input
				id="subject"
				name="subject"
				type="text"
				required
				value={initialSubject}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent"
				placeholder="What's this about?"
			/>
		</div>

		<div>
			<label for="message" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
			<textarea
				id="message"
				name="message"
				rows="6"
				required
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent resize-y"
				placeholder="Write your message to your representative...">{initialMessage}</textarea>
		</div>

		{#if status === 'error'}
			<div class="flex items-center gap-2 text-red-600 text-sm">
				<AlertCircle class="h-4 w-4" />
				{errorMessage}
			</div>
		{/if}

		{#if mailtoFallback}
			<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
				<p class="text-sm text-amber-800">
					Direct email sending isn't configured yet.
					<a href={mailtoFallback} class="font-semibold underline hover:text-amber-900">
						Click here to open in your email client instead.
					</a>
				</p>
			</div>
		{/if}

		<button
			type="submit"
			disabled={status === 'sending'}
			class="w-full py-3 px-4 bg-civic-700 text-white font-semibold rounded-lg hover:bg-civic-800 focus:outline-none focus:ring-2 focus:ring-civic-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
		>
			<Send class="h-5 w-5" />
			{status === 'sending' ? 'Sending...' : 'Send Message'}
		</button>
	</form>
{/if}
