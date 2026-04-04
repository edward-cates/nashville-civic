# Nashville Civic

**Make local politics accessible.** Enter your Nashville address, see every elected official who represents you, and contact them directly.

## What it does

- **Find your reps** — From Metro Council to U.S. Senate, everyone who represents your address
- **Contact them** — One-click email and phone for every representative
- **Council meetings** — See what's on the agenda before they vote
- **Track legislation** — Bills, ordinances, and resolutions searchable and clear

## Data sources (all free)

- **Nashville Legistar API** — Council members, meetings, agendas, legislation (no auth needed)
- **Nashville Open Data** — Council district boundaries with rep contact info
- **Google Civic Information API** — Representatives at all government levels
- **Open States API** — Tennessee state legislators and bills

## Tech stack

- [SvelteKit](https://svelte.dev) + Svelte 5
- [Tailwind CSS](https://tailwindcss.com) v4
- [Heroku](https://heroku.com) (adapter-node)

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/nashville-civic.git
cd nashville-civic
npm install

cp .env.example .env
# Edit .env with your API keys (see .env.example)

npm run dev
```

## API keys needed (all free)

| Service | Sign up |
|---------|---------|
| Google Civic API | [Google Cloud Console](https://console.cloud.google.com/) |
| Open States API | [Plural Policy](https://open.pluralpolicy.com/accounts/profile/) |
| Resend (email) | [resend.com](https://resend.com) |

## Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set ORIGIN=https://your-app-name-xxxxx.herokuapp.com
heroku config:set GOOGLE_CIVIC_API_KEY=your_key
heroku config:set OPEN_STATES_API_KEY=your_key
git push heroku main
```

## Adapt for your city

Nashville-first, but designed for other cities to fork:
1. Replace `static/districts.geojson` with your city's district boundaries
2. Update `src/lib/server/districts.ts` property names to match your GeoJSON
3. Change the Legistar base URL in `src/lib/server/legistar.ts` (if your city uses Legistar)
4. Update static info (mayor, clerk) in route files

## License

MIT
