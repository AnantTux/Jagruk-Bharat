# AnantTatt — Endless Coast

Real-time coastal hazard mapping and community reporting along India’s shoreline. Report hazards on the map, follow live updates, and help keep coastal communities informed.

## Features

- **Live hazard map** — Interactive map with severity markers and hazard details
- **Report hazards** — Submit type, severity, location, description, and photos
- **Dashboard** — Focused map view for monitoring active reports
- **Analytics** — Overview of hazard trends and activity
- **Accounts** — Email/password sign-up and sign-in (UI; wire to your auth provider for production)

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) / React Leaflet for maps
- [Radix UI](https://www.radix-ui.com/) + shadcn-style components

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
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
git clone https://github.com/AnantTux/AnantTatt
Set-Location AnantTatt
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
mongodb://127.0.0.1:27017/ananttatt
```

**MongoDB Atlas**

Create a cluster, create a database user, add your current IP address to the network access list, then copy the connection string from Atlas. It will look similar to:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/ananttatt?retryWrites=true&w=majority
```

Replace `USERNAME`, `PASSWORD`, and `cluster0.example.mongodb.net` with your Atlas values. Keep this connection string private.

### 4. Create the environment file

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set `MONGODB_URI` to the local or Atlas connection string selected above:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ananttatt
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

Hazard reports are stored in MongoDB. Uploaded photos are stored under `public/uploads/hazards/` (gitignored); use object storage such as S3, Cloudinary, or Supabase Storage for production deployments.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint (configure ESLint first) |

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
- **GitHub:** [AnantTux](https://github.com/AnantTux/DiaPredict)

## License

Private project unless otherwise noted by the repository owner.
