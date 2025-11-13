# Timediffs

Timezone comparison tool with a 24-hour timeline visualization.

## Features

- Natural language commands: "New York timezone", "Compare Tokyo with London", "Remove Paris"
- Multiple timezones displayed side-by-side on a 24-hour timeline
- Hover over hours to see corresponding times across all timezones
- Drag to reorder timezones
- Set a home timezone as reference
- Date picker and week view
- 12-hour and 24-hour time formats
- Browser timezone detection
- URL state management for sharing
- Auto-updates when viewing today's date
- Responsive design

## Tech Stack

- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS
- @vvo/tzdb (timezone data)
- date-fns, date-fns-tz (date handling)
- @dnd-kit (drag-and-drop)
- nuqs (URL state management)
- Radix UI

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Production requires:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Must be a valid HTTPS URL without trailing slash.

## Build

```bash
npm run build
npm start
```

## License

MIT
