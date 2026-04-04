<script lang="ts">
	import { BookOpen, Building2, FileText, Users, Megaphone, Landmark } from 'lucide-svelte';
</script>

<svelte:head>
	<title>How Nashville's Government Works - Nashville Civic</title>
	<meta
		name="description"
		content="A plain-language guide to how Nashville's Metro government works: the council, the mayor, how laws get made, and how you can get involved."
	/>
</svelte:head>

<!-- Header -->
<section class="bg-civic-900 text-white py-12 sm:py-16">
	<div class="max-w-3xl mx-auto px-4 sm:px-6">
		<h1 class="text-3xl sm:text-4xl font-bold mb-3">How Nashville's Government Works</h1>
		<p class="text-civic-200 text-lg leading-relaxed">
			The no-jargon guide. Think of this as a friend explaining how the city actually runs.
		</p>
	</div>
</section>

<div class="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
	<!-- Section 1: Overview -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<Building2 class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">How Nashville's government is set up</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				Nashville has what's called a "consolidated city-county government." That means the city of
				Nashville and Davidson County merged into one government back in 1963. So there's no separate
				county government -- it's all one thing, called Metro.
			</p>
			<p>
				There are two main parts: the <strong>Mayor</strong> and the
				<strong>Metro Council</strong>. The mayor runs the day-to-day operations. The council makes
				the laws and approves the budget.
			</p>
			<p>
				The Metro Council has <strong>40 members</strong>: 35 represent specific districts (neighborhoods),
				and 5 are "at-large" members who represent all of Nashville. Every Nashville resident has one
				district council member plus five at-large members.
			</p>
		</div>
	</section>

	<!-- Section 2: What Council Controls -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<Users class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">What does Metro Council actually control?</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				A lot more than you'd think. Here's the short list:
			</p>
			<ul class="list-disc pl-5 space-y-2">
				<li>
					<strong>Zoning</strong> -- what gets built where. That new apartment building going up
					down the street? Council approved it.
				</li>
				<li>
					<strong>The budget</strong> -- how Nashville spends about $3 billion a year on schools,
					police, fire, parks, transit, and everything else.
				</li>
				<li>
					<strong>Property taxes</strong> -- council sets the rate. This is usually the most
					controversial vote of the year.
				</li>
				<li>
					<strong>Building codes and permits</strong> -- the rules for how things get built.
				</li>
				<li>
					<strong>Transit and infrastructure</strong> -- roads, sidewalks, buses, greenways.
				</li>
				<li>
					<strong>Water and sewer</strong> -- yes, someone has to manage the pipes.
				</li>
			</ul>
			<p>
				If it affects your daily life in Nashville, council probably had a say in it.
			</p>
		</div>
	</section>

	<!-- Section 3: How a Bill Becomes Law -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<FileText class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">How a bill becomes a Nashville law</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				It's a multi-step process, but it's not complicated once you see it laid out.
			</p>
			<ol class="list-decimal pl-5 space-y-3">
				<li>
					<strong>Someone introduces a bill.</strong> Usually a council member, but sometimes the
					mayor's office sends one over. This is called "filing" it.
				</li>
				<li>
					<strong>First reading.</strong> The bill gets read out loud at a full council meeting.
					No debate, no vote -- it's just officially on the record now.
				</li>
				<li>
					<strong>Committee review.</strong> The bill goes to one or more committees -- small
					groups of council members who focus on specific topics. This is where the real work
					happens. They study it, ask questions, hear from the public, and sometimes change it.
					They can also kill it here.
				</li>
				<li>
					<strong>Second reading.</strong> Back to the full council. Now they actually debate it.
					Council members can propose changes (amendments). Then they vote. A simple majority
					passes it to the next step.
				</li>
				<li>
					<strong>Third reading.</strong> The final vote. The bill needs <strong>21 yes votes</strong>
					(out of 40) to pass. If it passes, it goes to the mayor.
				</li>
				<li>
					<strong>Mayor signs or vetoes.</strong> If the mayor signs it, it's law. If the mayor
					vetoes it, council can override the veto -- but they need <strong>27 votes</strong>
					instead of 21.
				</li>
			</ol>
			<p>
				The whole process usually takes a few weeks to a few months, depending on how controversial
				the bill is.
			</p>
		</div>
	</section>

	<!-- Section 4: Committees -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<BookOpen class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">
				What are committees and why do they matter?
			</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				Committees are where the real work happens in local government. They're small groups of
				council members who focus on specific topics.
			</p>
			<p>
				Some of the key ones:
			</p>
			<ul class="list-disc pl-5 space-y-2">
				<li><strong>Budget and Finance</strong> -- handles the money. The big one.</li>
				<li><strong>Planning and Zoning</strong> -- decides what gets built where.</li>
				<li><strong>Public Safety</strong> -- police, fire, emergency services.</li>
				<li><strong>Transportation and Infrastructure</strong> -- roads, transit, sidewalks.</li>
				<li><strong>Education</strong> -- works with Metro Nashville Public Schools.</li>
			</ul>
			<p>
				Here's why they matter: most bills get shaped in committee. By the time something reaches the
				full council for a vote, the committee has already studied it, held public hearings, and
				sometimes completely rewritten it. If you want to influence a bill, the committee stage is
				your best shot.
			</p>
			<p>
				Committees also have the power to "defer" a bill (basically pause it) or just never vote on
				it at all, which effectively kills it without a formal vote.
			</p>
		</div>
	</section>

	<!-- Section 5: Make Your Voice Heard -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<Megaphone class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">How to make your voice heard</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				You don't have to run for office to influence what happens in Nashville. Here are the most
				effective ways to participate:
			</p>
			<ol class="list-decimal pl-5 space-y-3">
				<li>
					<strong>Call or email your council member.</strong> This is the single most effective
					thing you can do. Council members pay attention to constituent contacts, especially
					phone calls. Be specific about what you want and why. You can find your council member's
					contact info on our <a href="/your-nashville" class="text-civic-700 underline underline-offset-2 hover:text-civic-900">Your Nashville</a> page.
				</li>
				<li>
					<strong>Attend public comment at meetings.</strong> Most council and committee meetings
					have a public comment period. You sign up to speak and get <strong>2 minutes</strong>.
					That might not sound like much, but it's on the official record and council members are
					required to be present. Bring a clear, specific point.
				</li>
				<li>
					<strong>Show up to committee meetings.</strong> These are smaller, more focused, and
					often more impactful than full council meetings. If there's a specific issue you care
					about, find out which committee handles it and attend when they discuss it.
				</li>
				<li>
					<strong>Write a letter to the Metro Clerk.</strong> Formal written comments get attached
					to the official record of legislation. Send to:
					Metropolitan Clerk, 1 Public Square, Suite 205, Nashville, TN 37201. Or email
					metro.clerk@nashville.gov.
				</li>
				<li>
					<strong>Attend community meetings.</strong> Many council members hold town halls or
					neighborhood meetings. These are less formal and a good way to build a relationship
					with your representative.
				</li>
			</ol>
			<p>
				The most important thing? Be specific. "I'm concerned about traffic on Main Street" is
				better than "traffic is bad." Give them something they can act on.
			</p>
		</div>
	</section>

	<!-- Section 6: The Mayor -->
	<section>
		<div class="flex items-center gap-3 mb-5">
			<div class="w-10 h-10 bg-civic-100 rounded-lg flex items-center justify-center shrink-0">
				<Landmark class="h-5 w-5 text-civic-700" />
			</div>
			<h2 class="text-2xl font-bold text-civic-900">The Mayor</h2>
		</div>
		<div class="border-l-4 border-civic-200 pl-6 space-y-4 text-gray-700 text-lg leading-relaxed">
			<p>
				The mayor is the head of Nashville's executive branch. Think of it like this: the council
				makes the rules, and the mayor's job is to carry them out.
			</p>
			<p>
				Here's what the mayor does:
			</p>
			<ul class="list-disc pl-5 space-y-2">
				<li>
					<strong>Proposes the annual budget.</strong> This is a huge deal -- it's a plan for how
					to spend billions of dollars. But council has to approve it, so it's a negotiation.
				</li>
				<li>
					<strong>Manages city departments.</strong> Police, fire, public works, parks,
					planning -- the mayor appoints the people who run these departments.
				</li>
				<li>
					<strong>Signs or vetoes bills.</strong> After council passes something, the mayor
					decides whether to make it law.
				</li>
				<li>
					<strong>Sets priorities.</strong> The mayor has a platform and uses the office to push
					for specific policies, whether that's affordable housing, transit, or public safety.
				</li>
			</ul>
			<p>
				The mayor and council are supposed to check each other. The mayor can't pass laws alone, and
				council can't run the government day-to-day. When they disagree, that's actually the system
				working as designed -- it forces compromise.
			</p>
		</div>
	</section>

	<!-- Bottom CTA -->
	<section class="bg-civic-50 rounded-xl p-6 sm:p-8 text-center">
		<h2 class="text-xl font-bold text-civic-900 mb-3">Ready to find your representatives?</h2>
		<p class="text-gray-600 mb-6">
			Now that you know how it works, find out who represents you.
		</p>
		<a
			href="/your-nashville"
			class="inline-block px-6 py-3 bg-civic-700 text-white font-semibold rounded-lg hover:bg-civic-800 transition-colors"
		>
			Find My Representatives
		</a>
	</section>
</div>
