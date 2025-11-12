# Timediffs

A timezone comparison tool that displays multiple timezones side-by-side on a 24-hour timeline.

## Features

- Compare multiple timezones on a 24-hour timeline
- Hover over hours to see corresponding times across all timezones
- Drag to reorder timezones
- Set a home timezone
- View any date or toggle to week view
- Switch between 12-hour and 24-hour formats
- Browser timezone detection
- State stored in URL for sharing
- Updates automatically when viewing today's date
- Responsive layout for mobile, tablet, and desktop

## Tech Stack

- Next.js 16 with App Router
- React 19 with TypeScript
- Tailwind CSS
- @vvo/tzdb for timezone data
- date-fns & date-fns-tz for date handling
- @dnd-kit for drag-and-drop
- nuqs for URL state management
- Radix UI primitives

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

For production, set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Must be a valid HTTPS URL without trailing slash. Required in production.

## Build

```bash
npm run build
npm start
```

## License

MIT
