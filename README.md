# Dev Coach

Dev Coach is a Next.js demo app for surfacing coaching insights from sample engineering activity data. It includes an individual contributor dashboard, a manager view, and a lightweight insight engine that turns sprint and daily activity signals into coaching actions.

## Features

- Individual coaching dashboard at `/`
- Manager coaching overview at `/manager`
- Demo engineer examples selected with query params
- Generated insights with severity, recommended action, and rationale
- Sample team and engineer data stored locally in JSON
- Tailwind CSS styling with reusable React components

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
```

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.

## Project Structure

```text
app/
  page.tsx            Individual coaching dashboard
  manager/page.tsx    Manager coaching view
components/           Shared UI components
data/                 Sample engineer and team data
lib/                  Data access, insight logic, and shared types
```

## Demo Data

The app uses `data/engineers.json` as its local data source. Insight generation lives in `lib/insights.ts`, while helper functions for selecting engineers and teams live in `lib/data.ts`.
