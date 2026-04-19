<script lang="ts">
	import ContactForm from '$lib/components/ContactForm.svelte';
	import { page } from '$app/state';
	import { Mail, Phone, ChevronDown, ChevronUp, Clipboard, Check, Lightbulb, MessageSquareText } from 'lucide-svelte';

	const repName = page.url.searchParams.get('rep') || '';
	const repEmail = page.url.searchParams.get('email') || '';
	const repLevel = page.url.searchParams.get('level') || 'local';
	const initialSubject = page.url.searchParams.get('subject') || '';
	const initialMessage = page.url.searchParams.get('body') || '';

	let templatesOpen = $state(false);
	let expandedTemplate = $state<number | null>(null);
	let copiedIndex = $state<number | null>(null);

	const templates = [
		{
			label: "I'm concerned about a zoning/development issue",
			subject: 'Concern about a zoning/development issue in my neighborhood',
			body: `Hi [Rep Name],

My name is [Your Name] and I live in [Your Neighborhood]. I'm writing because I'm concerned about a zoning or development project near [Location]. I've noticed [describe what you've seen — construction, rezoning signs, increased traffic, etc.] and I'm worried about how it will affect our neighborhood.

Could you share any information about this project and let me know how residents can have a say in the process?

Thank you for your time.`
		},
		{
			label: 'I want better transit/transportation options',
			subject: 'Request for better transit and transportation options',
			body: `Hi [Rep Name],

My name is [Your Name] and I live in [Your Neighborhood]. Getting around Nashville can be really tough, and I'd love to see improvements to our transit and transportation options. Specifically, [describe your situation — long commute, no bus route nearby, unsafe bike lanes, etc.].

Better transportation would help me and my neighbors [describe the impact — get to work/school, reduce traffic, save money, etc.]. I'd appreciate knowing what plans are in the works and how I can support them.

Thanks for listening!`
		},
		{
			label: 'I have a public safety concern',
			subject: 'Public safety concern in my area',
			body: `Hi [Rep Name],

My name is [Your Name] and I live in [Your Neighborhood]. I'm reaching out because I have a safety concern about [describe the issue — speeding on a street, broken streetlights, crosswalk needed, etc.] near [Location].

This has been going on for [how long] and it affects [who — you, your family, neighbors, kids walking to school, etc.]. I'd really appreciate any help getting this addressed.

Thank you for looking into this.`
		},
		{
			label: 'Thank you for your work on...',
			subject: 'Thank you for your work on [topic]',
			body: `Hi [Rep Name],

My name is [Your Name] and I just wanted to say thank you for your work on [topic or issue]. It really matters to me because [explain why — how it affects you, your family, or your community].

It's great to see elected officials working on things that make a real difference. Keep it up!

Thanks again.`
		},
		{
			label: 'Please vote yes/no on...',
			subject: 'Please vote [yes/no] on [bill or proposal]',
			body: `Hi [Rep Name],

My name is [Your Name] and I live in [Your Neighborhood]. I'm writing to ask you to vote [yes/no] on [bill name or number, or describe the proposal].

This matters to me because [explain why — how it affects you personally, your family, or your community]. I believe that [your reasoning in 1-2 sentences].

Thank you for considering my perspective. I'll be following this closely.`
		}
	];

	function toggleTemplate(index: number) {
		expandedTemplate = expandedTemplate === index ? null : index;
	}

	async function copyToClipboard(index: number) {
		const template = templates[index];
		const text = `Subject: ${template.subject}\n\n${template.body}`;
		try {
			await navigator.clipboard.writeText(text);
			copiedIndex = index;
			setTimeout(() => {
				copiedIndex = null;
			}, 2000);
		} catch {
			// Fallback: some browsers block clipboard in non-secure contexts
		}
	}
</script>

<svelte:head>
	<title>Contact Your Rep — Nashville Civic</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	<h1 class="text-3xl font-bold text-gray-900">Contact Your Representative</h1>
	<p class="mt-3 text-lg text-gray-600 leading-relaxed">
		Your elected officials work for you. Seriously — that's their job.
		If something in Nashville bugs you, or if they did something great, tell them.
		It takes like five minutes and it actually makes a difference.
	</p>

	{#if repName && repEmail}
		<!-- Message Templates -->
		<div class="mt-8">
			<button
				onclick={() => templatesOpen = !templatesOpen}
				class="w-full flex items-center justify-between gap-3 bg-civic-50 border border-civic-200 rounded-lg px-5 py-4 text-left hover:bg-civic-100 transition-colors"
			>
				<div class="flex items-center gap-3">
					<MessageSquareText class="h-5 w-5 text-civic-600 shrink-0" />
					<span class="font-semibold text-civic-900">Not sure what to say?</span>
				</div>
				{#if templatesOpen}
					<ChevronUp class="h-5 w-5 text-civic-500 shrink-0" />
				{:else}
					<ChevronDown class="h-5 w-5 text-civic-500 shrink-0" />
				{/if}
			</button>

			{#if templatesOpen}
				<div class="mt-3 space-y-3">
					<p class="text-sm text-gray-500 italic px-1">
						Use these as a starting point. The more personal your message, the more impact it has.
						Copy one, paste it into the form below, then make it your own.
					</p>

					{#each templates as template, i}
						<div class="border border-gray-200 rounded-lg overflow-hidden">
							<button
								onclick={() => toggleTemplate(i)}
								class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
							>
								<span class="text-sm font-medium text-gray-800">{template.label}</span>
								{#if expandedTemplate === i}
									<ChevronUp class="h-4 w-4 text-gray-400 shrink-0" />
								{:else}
									<ChevronDown class="h-4 w-4 text-gray-400 shrink-0" />
								{/if}
							</button>

							{#if expandedTemplate === i}
								<div class="px-4 pb-4 border-t border-gray-100">
									<div class="mt-3 space-y-2">
										<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</p>
										<p class="text-sm text-gray-700">{template.subject}</p>
									</div>
									<div class="mt-3 space-y-2">
										<p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
										<p class="text-sm text-gray-700 whitespace-pre-line">{template.body}</p>
									</div>
									<button
										onclick={() => copyToClipboard(i)}
										class="mt-4 inline-flex items-center gap-2 rounded-md bg-civic-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-civic-700 transition-colors"
									>
										{#if copiedIndex === i}
											<Check class="h-4 w-4" />
											Copied!
										{:else}
											<Clipboard class="h-4 w-4" />
											Copy to clipboard
										{/if}
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Tone Guidance -->
		<div class="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
			<div class="flex items-start gap-3">
				<Lightbulb class="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
				<div>
					<h3 class="font-semibold text-amber-900 text-sm">Tips for writing a great message</h3>
					<ul class="mt-2 space-y-1.5 text-sm text-amber-800">
						<li><strong>Be specific.</strong> "The pothole at 5th and Main has been there for 3 months" is better than "fix the roads."</li>
						<li><strong>Be respectful.</strong> They're more likely to listen.</li>
						<li><strong>Tell them how it affects you personally.</strong> Personal stories stick.</li>
						<li><strong>Keep it short.</strong> 3-4 sentences is perfect.</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Contact Form -->
		<div class="mt-8">
			<ContactForm
				representativeName={repName}
				representativeEmail={repEmail}
				representativeLevel={repLevel}
				{initialSubject}
				{initialMessage}
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
