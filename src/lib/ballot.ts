/**
 * Current Davidson County ballot, transcribed from the official sample ballot
 * (Davidson County Election Commission). Update this file each election cycle.
 */

export const SAMPLE_BALLOT_URL =
	'https://www.nashville.gov/sites/default/files/2026-09/Sample_Ballot_November_3_2026_State_Fed_Gen_Mun_Elections.pdf';
export const AMENDMENTS_URL = 'https://sos.tn.gov/elections/announcements/2026-proposed-constitutional-amendments';
export const POLLING_PLACE_URL = 'https://maps.nashville.gov/PollingPlaceFinder';
export const GOVOTETN_URL = 'https://web.go-vote-tn.elections.tn.gov/';

export const ELECTION = {
	name: 'State and Federal General Election',
	dateLabel: 'Tuesday, November 3, 2026',
	// Polls close 7:00 pm Central (CST, UTC-6) on Nov 3.
	pollsClose: new Date('2026-11-04T01:00:00Z'),
	// Show the ballot until a week after election day; after that the page falls back to the general guide.
	hideAfter: new Date('2026-11-11T06:00:00Z'),
	hours: '7:00 am – 7:00 pm'
};

export interface Candidate {
	name: string;
	party?: string;
}

export interface Race {
	office: string;
	district?: string;
	voteFor?: number;
	candidates: Candidate[];
}

export interface Amendment {
	number: number;
	title: string;
	summary: string;
	yesMeans: string;
	noMeans: string;
}

const R = 'Republican';
const D = 'Democrat';
const I = 'Independent';

export const AMENDMENTS: Amendment[] = [
	{
		number: 1,
		title: 'Denying bail before trial',
		summary:
			'Today the Tennessee Constitution says everyone can get bail except people charged with a capital (death-penalty) offense. This would let a judge hold someone without bail before trial if they are charged with a capital offense, terrorism, second-degree murder, aggravated rape of a child, aggravated rape, grave torture, or any crime that requires serving 85% of the sentence — when the proof is evident or the presumption great. Judges would have to state on the record why they granted or denied bail.',
		yesMeans: 'Judges can deny bail before trial for this longer list of serious charges.',
		noMeans: 'Bail stays guaranteed for everyone except people charged with capital offenses.'
	},
	{
		number: 2,
		title: 'Banning a statewide property tax',
		summary:
			'Tennessee has no state property tax today. This adds language to the Constitution saying the Legislature can never levy or authorize a state tax on real, personal, or mixed property. It does not change local property taxes (like Metro Nashville’s).',
		yesMeans: 'A statewide property tax is permanently banned in the Constitution.',
		noMeans: 'No constitutional ban; the Legislature could, in theory, create one later.'
	},
	{
		number: 3,
		title: 'Expanding crime victims’ rights',
		summary:
			'Replaces the existing victims’ rights section with a longer list of 13 rights. New rights include fair treatment; being informed about and participating in parole; protection from harassment and intimidation; being told the minimum sentence and scheduled release date; and having safety considered before any release decision. Existing rights (notice of proceedings, being present and heard, restitution, a speedy resolution) are kept. It does not limit prosecutors or courts, and does not let victims sue the state.',
		yesMeans: 'The Constitution’s list of crime victims’ rights is replaced with the expanded list.',
		noMeans: 'The current victims’ rights section stays as written.'
	}
];

export const AMENDMENT_PASSING_RULE =
	'To pass, an amendment needs more Yes than No votes, and its Yes votes must be more than half of all votes cast in the governor’s race. Skipping an amendment effectively counts against it.';

/** Races every Davidson County voter sees. */
export const COUNTYWIDE_RACES: Race[] = [
	{
		office: 'Governor',
		candidates: [
			{ name: 'Marsha Blackburn', party: R },
			{ name: 'Jerri Green', party: D },
			...[
				'Misam Abidi', 'Dean Brewer', 'Ray Brown', 'David Hatley', 'Wendell Jackson',
				'Charles Van Morgan', 'Eddie Lee Murphy', 'Lauren Pinkston', 'Victor L. Scoggin',
				'Dave Seeman', 'Karl Knox Smithson', 'L. Webb Taylor', 'Robert C. Vick'
			].map((name) => ({ name, party: I }))
		]
	},
	{
		office: 'U.S. Senate',
		candidates: [
			{ name: 'Bill Hagerty', party: R },
			{ name: 'Marquita Bradshaw', party: D },
			...[
				'Tharon Chandler', 'Andrew Gerena', 'Jeremy Dean Hearn', 'Robert Jones',
				'James William Macon III', 'Yoshi D. Matthews', 'David Sutman, Jr.',
				'Catherine Barcel “Barcy” Whitson'
			].map((name) => ({ name, party: I }))
		]
	}
];

/** Races that depend on which district you live in. */
export const DISTRICT_RACES: { group: string; races: Race[] }[] = [
	{
		group: 'U.S. House',
		races: [
			{
				office: 'U.S. House',
				district: '4',
				candidates: [
					{ name: 'Scott DesJarlais', party: R },
					{ name: 'Victoria Broderick', party: D },
					{ name: 'Jacob Kristopher Anders', party: I },
					{ name: 'Clay Faircloth', party: I }
				]
			},
			{
				office: 'U.S. House',
				district: '6',
				candidates: [
					{ name: 'Johnny Garrett', party: R },
					{ name: 'Mike Croley', party: D },
					{ name: 'Christopher B. Monday', party: I },
					{ name: 'Angus Purdy', party: I }
				]
			},
			{
				office: 'U.S. House',
				district: '7',
				candidates: [
					{ name: 'Matt Van Epps', party: R },
					{ name: 'Darden Copeland', party: D },
					{ name: 'Andrew J. Koontz', party: I },
					{ name: 'Lowell Reynolds', party: I }
				]
			}
		]
	},
	{
		group: 'Tennessee Senate',
		races: [
			{ office: 'TN Senate', district: '17', candidates: [{ name: 'Mark Pody', party: R }, { name: 'Lindsey Patrick-Wright', party: D }] },
			{ office: 'TN Senate', district: '19', candidates: [{ name: 'Charlane Oliver', party: D }] },
			{ office: 'TN Senate', district: '21', candidates: [{ name: 'Jeff Yarbro', party: D }] }
		]
	},
	{
		group: 'Tennessee House',
		races: [
			{ office: 'TN House', district: '50', candidates: [{ name: 'Bo Mitchell', party: D }] },
			{ office: 'TN House', district: '51', candidates: [{ name: 'Aftyn Behn', party: D }] },
			{ office: 'TN House', district: '52', candidates: [{ name: 'Michele Vetter', party: R }, { name: 'Justin Jones', party: D }, { name: 'Martez Coleman', party: I }] },
			{ office: 'TN House', district: '53', candidates: [{ name: 'Jason L Powell', party: D }] },
			{ office: 'TN House', district: '54', candidates: [{ name: 'Vincent Dixie', party: D }] },
			{ office: 'TN House', district: '55', candidates: [{ name: 'Jayla Thomas', party: R }, { name: 'John Ray Clemmons', party: D }] },
			{ office: 'TN House', district: '56', candidates: [{ name: 'Bob Freeman', party: D }] },
			{ office: 'TN House', district: '58', candidates: [{ name: 'Harold M. Love, Jr.', party: D }] },
			{ office: 'TN House', district: '59', candidates: [{ name: 'Bill Hancock', party: R }, { name: 'Mark Proctor', party: D }] },
			{ office: 'TN House', district: '60', candidates: [{ name: 'Eva Angelina Romero', party: R }, { name: 'Shaundelle Brooks', party: D }] }
		]
	},
	{
		group: 'City elections (Belle Meade, Forest Hills, Goodlettsville only)',
		races: [
			{ office: 'Belle Meade City Commissioner', voteFor: 3, candidates: ['Louise C. Bryan', 'Neal Clayton', 'Rusty Moore', 'Gray Oliver Thornburg'].map((name) => ({ name })) },
			{ office: 'Forest Hills City Commissioner', voteFor: 2, candidates: ['Jim Gardner', 'Henry Trost'].map((name) => ({ name })) },
			{ office: 'Goodlettsville City Commissioner', voteFor: 2, candidates: ['Jimmy D. Anderson', 'Eric Meacham', 'Michael Milliner', 'Eric Near', 'Rusty Tinnin'].map((name) => ({ name })) }
		]
	}
];

export const LOCAL_MEASURES = [
	{
		title: 'Goodlettsville sales tax referendum',
		where: 'Goodlettsville voters only',
		text: 'Shall the Goodlettsville Investment Act (Ordinance No. 26-1146), for investing in city services such as parks, roads, and public safety, be approved by raising the city’s sales tax by a half-penny per dollar?'
	}
];

export function isBallotActive(now = new Date()): boolean {
	return now < ELECTION.hideAfter;
}

export function arePollsClosed(now = new Date()): boolean {
	return now >= ELECTION.pollsClose;
}
