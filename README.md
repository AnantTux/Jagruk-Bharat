# Jagruk Bharat — India Safety Network

Community-powered public hazard reporting and live safety mapping across India. Report hazards on the map, follow live updates, and help people nearby make safer decisions.

> [!IMPORTANT]
> Jagruk Bharat is an experimental MVP created for educational and portfolio purposes. Community reports are not independently verified, and the platform is not affiliated with emergency services. In an emergency, contact the appropriate local authorities directly.

## Project status

The core hazard-reporting workflow is functional: Firebase-verified users can sign in with Google or email/password, submit geolocated reports, attach photos, view reports on an interactive map, and vote on their reliability. Supported categories include road accidents, fires, flooding, landslides, blocked routes, unsafe infrastructure, electrical hazards, pollution, and severe weather. The social analytics dashboard still uses illustrative data.

## Features

- **Live hazard map** — Interactive map with severity markers and hazard details
- **Report hazards** — Submit type, severity, observation time, location, description, optional phone number, and up to five photos
- **Dashboard** — India-wide map view for monitoring and filtering active reports
- **Analytics** — Overview of hazard trends and activity
- **Community verification** — Upvote or downvote reports to contribute to their trust score
- **Accounts** — Firebase Google and email/password sign-in, verified sessions, logout, suspension support, and password reset
- **Privacy controls** — Public map coordinates are rounded, uploads are re-encoded to remove EXIF metadata, contact phone numbers stay private, and users can flag harmful content for moderation
- **Safe reporting limits** — Only successfully saved reports count toward the limit of three reports per signed-in user per hour

## How it works

1. A community member reports a public hazard and selects its location on the map.
2. The report is validated by the API and stored in MongoDB.
3. Submitted photos are checked, stripped of device metadata, stored in Cloudinary, and displayed in the report details.
4. A WebSocket pushes new reports and votes to connected maps instantly. If that connection is unavailable, the app automatically uses long-polling instead.
5. Community members can confirm or dispute reports through voting.

## Current limitations

- Reports and emergency flags are community-submitted and do not notify emergency services.
- Firebase must be configured with the deployed website domain before Google sign-in can work.
- Social-media analytics currently use illustrative sample data.
- Production photo uploads require Cloudinary; local development can use local file storage.
- Active reports disappear from public results after six hours unless their original reporter confirms they are still active. The free Render configuration does not run the optional background expiry worker, so database status cleanup requires an external scheduler if needed.
- Duplicate detection and regional alert emails are not implemented yet.

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
- [pnpm](https://pnpm.io/) 11 or later
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
| `MONGODB_URI` | MongoDB connection string used to persist hazard reports |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app ID |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase service-account project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase service-account client email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase service-account private key; use literal `\n` between lines when setting it in a hosting dashboard |
| `CRON_SECRET` | Long random value used to protect the automated report-expiry endpoint |
| `REDIS_URL` | Optional Redis connection for rate limits and queued maintenance; Render supplies this from its free Key Value service |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for production photo uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Optional error monitoring; the app works normally when both are blank |

### Initial administrator

All public sign-ups are permanently created as `citizen`; neither the browser nor Firebase can assign staff roles. After creating and verifying your own account, make it the first administrator from a trusted terminal:

```powershell
pnpm user:role you@example.com admin
```

Administrators can then use `PATCH /api/admin/users/:id/role` to assign `citizen`, `responder`, `moderator`, or `admin`. Every role change is recorded in the audit log. Moderators can review flagged content through `GET` and `PATCH /api/admin/moderation`.

### Free deployment on Render

The repository includes [`render.yaml`](render.yaml) for a free Render web service and a free Render Key Value (Redis) instance. MongoDB Atlas and Cloudinary can both be used on their free plans.

1. In Render, create a new Blueprint from this GitHub repository. Keep the generated web-service name, or use a name of your choice.
2. Add the Firebase, MongoDB Atlas, and Cloudinary variables listed above. Render creates `CRON_SECRET` and links `REDIS_URL` automatically.
3. In Firebase Console, enable the required sign-in providers and add the exact Render domain (for example, `your-service.onrender.com`) to **Authentication → Settings → Authorised domains**.
4. For `FIREBASE_ADMIN_PRIVATE_KEY`, paste the private key as one line containing literal `\n` line breaks. Do not wrap the value in extra quotation marks.
5. Deploy. Render checks `/api/health` to confirm the service is ready. Every push to `main` triggers a new deployment.

Free Render services can sleep after inactivity, so the first request after a pause may take longer. The optional background worker is intentionally not deployed on the free plan.

### Privacy and content moderation

Public map coordinates are intentionally rounded to approximately 100 metres. The exact point stays in MongoDB for server-side proximity checks. Uploaded images are signature-checked, resized, re-encoded as JPEG, and stripped of camera metadata before storage. Users can submit an abuse/privacy/misinformation flag at `POST /api/hazards/:id/flags`; staff can hide or reject a flagged hazard. Reports are assigned a 90-day retention timestamp for a scheduled cleanup worker.

Firebase delivers verification and password-reset emails. Configure the Firebase email templates and authorised domains in Firebase Console before testing these flows in production.

### Automated report expiry

New reports stay active for six hours. Public map queries automatically hide a report once its expiry time passes. If you also want overdue records marked `expired` in MongoDB, an external scheduler can make an hourly request to `GET /api/cron/expire-hazards` with the header `Authorization: Bearer <CRON_SECRET>`. The original reporter can renew an active report with `POST /api/hazards/<id>/confirm-active` while signed in.

### Account suspension

An administrator can suspend an account from the project directory without exposing a public administration endpoint:

```powershell
pnpm user:suspend user@example.com Repeated false reports
```

Suspension immediately removes all sessions and prevents future login. The user record and moderation reason remain in MongoDB for review.

Hazard reports are stored in MongoDB. In production, photos are stored in Cloudinary. Local development can store uploads under `public/uploads/hazards/` (gitignored).

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
| `pnpm test:e2e` | Run the browser tests for sign-up, report access, and live updates |
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

## Local Docker workflow

Use Docker to run the app and a separate local MongoDB database on your computer. This does not use Vercel or Render.

1. Install and open [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Create `.env.local` from `.env.example` and fill in your Firebase values. Keep secrets out of Git.
3. In this project folder, run:

   ```bash
   docker compose --env-file .env.local up --build
   ```

4. Open http://localhost:3000.

The Docker setup stores MongoDB data and locally uploaded photos in Docker volumes. It does not need production Cloudinary credentials for local testing. Stop it with `docker compose down`. To erase only the local test database and uploaded test photos, use `docker compose down -v`.
