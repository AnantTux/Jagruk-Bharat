# AnantTatt — Endless Coast

Real-time coastal hazard mapping and community reporting along India’s shoreline. Report hazards on the map, follow live updates, and help keep coastal communities informed.

## Features

- **Live hazard map** — Interactive map with severity markers and hazard details
- **Report hazards** — Submit type, severity, location, description, and photos
- **Dashboard** — Focused map view for monitoring active reports
- **Analytics** — Overview of hazard trends and activity
- **Accounts** — Email/password sign-up and sign-in (UI; wire to your auth provider for production)

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) / React Leaflet for maps
- [Radix UI](https://www.radix-ui.com/) + shadcn-style components

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm

### Install and run

```bash
git clone <your-repo-url>
cd ocean-hazard-platform_3
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy the example file and adjust as needed:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional; only if you switch from Leaflet to Google Maps |

Hazard reports use in-memory storage in development. Uploaded photos are stored under `public/uploads/hazards/` (gitignored). For production, use a database and object storage (e.g. PostgreSQL + S3 or Supabase).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |

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
