# Timediffs

A timezone comparison tool that displays multiple timezones on a 24-hour timeline.

## Features

- Compare multiple timezones side-by-side on a 24-hour timeline
- Hover over hours to see corresponding times across all timezones
- Add or remove timezones, drag to reorder, and set a home timezone
- View any date or toggle to week view
- State stored in URL for sharing
- Updates automatically when viewing today's date
- Responsive layout for mobile, tablet, and desktop

## Tech Stack

- Next.js 16 with App Router
- React 19 with TypeScript
- Tailwind CSS
- @vvo/tzdb for timezone data
- date-fns for date formatting
- dnd-kit for drag-and-drop reordering
- nuqs for URL state management

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## License

MIT
