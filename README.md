# Jagruk Bharat — India Safety Network

Community-powered public hazard reporting and live safety mapping across India. Report hazards on the map, follow live updates, and help people nearby make safer decisions.

> [!IMPORTANT]
> Jagruk Bharat is an experimental MVP created for educational and portfolio purposes. Community reports are not independently verified, and the platform is not affiliated with emergency services. In an emergency, contact the appropriate local authorities directly.

## Project status

The core hazard-reporting workflow is functional: verified users can submit geolocated reports, attach photos, view reports on an interactive map, and vote on their reliability. Supported categories include road accidents, fires, flooding, landslides, blocked routes, unsafe infrastructure, electrical hazards, pollution, and severe weather. The social analytics dashboard still uses illustrative data.

## Features

- **Live hazard map** — Interactive map with severity markers and hazard details
- **Report hazards** — Submit type, severity, location, description, and photos
- **Dashboard** — India-wide map view for monitoring and filtering active reports
- **Analytics** — Overview of hazard trends and activity
- **Community verification** — Upvote or downvote reports to contribute to their trust score
- **Accounts** — Verified email/password accounts, secure sessions, logout, suspension support, and password reset

## How it works

1. A community member reports a public hazard and selects its location on the map.
2. The report is validated by the API and stored in MongoDB.
3. Submitted photos are saved with the report and displayed in its details.
4. A WebSocket pushes new reports and votes to connected maps instantly. If that connection is unavailable, the app automatically uses long-polling instead.
5. Community members can confirm or dispute reports through voting.

## Current limitations

- Reports and emergency flags are community-submitted and do not notify emergency services.
- Regional hazard-alert emails are not implemented yet; account verification and password-reset emails require Resend in production.
- Social-media analytics currently use illustrative sample data.
- Photo uploads use Vercel Blob in production and local storage only during local development.
- Native WebSockets require a long-running Node.js server. On Vercel, the app automatically uses long-polling until a managed realtime service is added.
- Active reports expire after six hours unless their original reporter confirms they are still active. Configure an external scheduler to call the protected expiry endpoint every hour before deploying this feature.
- Moderation, rate limiting, duplicate detection, and verified responder roles are not yet implemented.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- JavaScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) for maps
- [Radix UI](https://www.radix-ui.com/) + shadcn-style components

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- [pnpm](https://pnpm.io/) 9 or later
- A MongoDB database: either [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas/database) cluster

Confirm Node.js and pnpm are available:

```powershell
node --version
pnpm --version
```

If pnpm is not installed, install it globally:

```powershell
npm install --global pnpm
```

### 1. Get the project

Clone the repository, or open the project folder if it is already downloaded:

```powershell
git clone https://github.com/AnantTux/Jagruk-Bharat
Set-Location Jagruk-Bharat
```

### 2. Install dependencies

```powershell
pnpm install
```

### 3. Set up MongoDB

Choose one option.

**Local MongoDB**

Install MongoDB Community Server, start its MongoDB service, then use this connection string:

```text
mongodb://127.0.0.1:27017/jagruk-bharat
```

**MongoDB Atlas**

Create a cluster, create a database user, add your current IP address to the network access list, then copy the connection string from Atlas. It will look similar to:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/jagruk-bharat?retryWrites=true&w=majority
```

Replace `USERNAME`, `PASSWORD`, and `cluster0.example.mongodb.net` with your Atlas values. Keep this connection string private.

### 4. Create the environment file

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set `MONGODB_URI` to the local or Atlas connection string selected above:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/jagruk-bharat
```

`.env.local` is ignored by Git, so credentials are not committed to the repository.

### 5. Start the development server

```powershell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The first submitted report creates a document in the MongoDB `hazards` collection.

### Verify the installation

1. Open the homepage and confirm the map loads.
2. Select **Report Hazard** and submit a test report with valid coordinates.
3. Open the dashboard and confirm the report appears.
4. Restart `pnpm dev`; the report should still appear, proving it was saved in MongoDB.

### Troubleshooting

| Problem | What to check |
|---|---|
| `Missing MONGODB_URI` | Ensure `.env.local` is in the project root and contains `MONGODB_URI=...`, then restart `pnpm dev`. |
| `ECONNREFUSED 127.0.0.1:27017` | Start the local MongoDB service, or switch to a MongoDB Atlas URI. |
| Atlas connection timeout | Add your current IP address in Atlas Network Access and verify the database username/password. |
| PowerShell says `MONGODB_URI=...` is not recognized | Put the value in `.env.local`; do not paste it directly into PowerShell. |
| Port 3000 is occupied | Stop the other development server, or run `pnpm dev -- --port 3001`. |

### Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional; only if you switch from Leaflet to Google Maps |
| `MONGODB_URI` | MongoDB connection string used to persist hazard reports |
| `RESEND_API_KEY` | Resend API key for account verification and password-reset emails in production |
| `AUTH_EMAIL_FROM` | Sender address on a domain verified with Resend |
| `CRON_SECRET` | Long random value used to protect the automated report-expiry endpoint |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token for permanent production photo uploads |

When the two email variables are omitted during local development, the signup and password-reset screens display the one-time development code. Production never returns these codes to the browser.

### Automated report expiry

New reports stay active for six hours. A scheduler should make an hourly request to `GET /api/cron/expire-hazards` with the header `Authorization: Bearer <CRON_SECRET>`. It marks overdue reports as expired, removes them from the public map, and sends a live-update event. The original reporter can renew an active report with `POST /api/hazards/<id>/confirm-active` while signed in.

### Account suspension

An administrator can suspend an account from the project directory without exposing a public administration endpoint:

```powershell
pnpm user:suspend user@example.com Repeated false reports
```

Suspension immediately removes all sessions and prevents future login. The user record and moderation reason remain in MongoDB for review.

Hazard reports are stored in MongoDB. In production, photos are stored in Vercel Blob; create a public Blob store connected to the Vercel project and it will provide `BLOB_READ_WRITE_TOKEN`. Local development continues to store uploads under `public/uploads/hazards/` (gitignored).

### Nearby hazards API

Reports now store a MongoDB GeoJSON location with a `2dsphere` index. Clients can retrieve up to 100 active reports near a point through `GET /api/hazards/near?lat=28.6139&lng=77.209&radiusKm=5`; the maximum radius is 50 km.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint with Next.js Core Web Vitals rules |
| `pnpm test` | Run unit and API tests |
| `pnpm test:e2e` | Run the browser-based report-flow test |
| `pnpm check` | Run lint, unit/API tests, and the production build |
| `pnpm user:suspend <email> [reason]` | Suspend an account and remove its active sessions |

## Project structure

```
app/              # Pages and API routes
  api/hazards/    # Hazard list/create API
  dashboard/      # Live safety map
  report/         # Hazard reporting flow
  analytics/      # Analytics view
components/       # UI and map components
hooks/            # React hooks (e.g. use-hazards)
lib/              # Types, hazard store, utilities
public/           # Static assets
```

## Contact

- **Email:** anantkaurav53@gmail.com
- **LinkedIn:** [Anant Kaurav](https://www.linkedin.com/in/anant-kaurav-83a6b1361)
- **GitHub:** [AnantTux](https://github.com/AnantTux)

## License

This project is open source and available under the [MIT License](LICENSE).
