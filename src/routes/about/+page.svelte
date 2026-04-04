<svelte:head>
	<title>About — Nashville Civic</title>
</svelte:head>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
	<h1 class="text-3xl font-bold text-gray-900">About Nashville Civic</h1>

	<div class="mt-6 prose prose-gray max-w-none space-y-6">
		<p class="text-lg text-gray-700">
			Nashville Civic exists because local politics matters more than most people realize — and it's way harder to follow than it should be.
		</p>

		<p class="text-gray-600">
			Your Metro Council member votes on zoning, transit, affordable housing, policing, and schools. These decisions shape your daily life more directly than anything happening in Washington. But finding out who your council member is, what they're voting on, or how to contact them? That's unreasonably difficult.
		</p>

		<p class="text-gray-600">
			This tool fixes that. Enter your address, see your representatives at every level of government, and contact them directly. No accounts, no tracking, no partisan spin — just information.
		</p>

		<h2 class="text-xl font-semibold text-gray-900 mt-8">How it works</h2>
		<ul class="text-gray-600 space-y-2">
			<li><strong>Representative lookup</strong> uses the Google Civic Information API and Open States API to find your elected officials at every level.</li>
			<li><strong>Council data</strong> comes directly from Nashville's Legistar system — the same system the Metro Council uses to track meetings, legislation, and votes.</li>
			<li><strong>District mapping</strong> uses official boundary data from the Nashville Open Data Portal.</li>
		</ul>

		<h2 class="text-xl font-semibold text-gray-900 mt-8">Privacy</h2>
		<p class="text-gray-600">
			We don't create user accounts. We don't track you. Your address is used only to look up your representatives and is stored in your browser's local storage (so you don't have to re-enter it) — never on our servers. Contact form messages are sent directly to your representative and are not stored.
		</p>

		<h2 class="text-xl font-semibold text-gray-900 mt-8">Open Source</h2>
		<p class="text-gray-600">
			Nashville Civic is open source under the MIT license. The code is designed so other cities can fork it and adapt it to their own local government. If you're a developer, we welcome contributions.
		</p>
		<p class="text-gray-600">
			<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="text-civic-700 hover:text-civic-800 font-medium underline">
				View on GitHub
			</a>
		</p>

		<h2 class="text-xl font-semibold text-gray-900 mt-8">Non-partisan</h2>
		<p class="text-gray-600">
			This tool surfaces public information about elected officials and government activity. It does not rate, rank, or editorialize. Party affiliations are shown as reported by official sources. We believe informed citizens make better decisions regardless of their political views.
		</p>
	</div>
</div>
