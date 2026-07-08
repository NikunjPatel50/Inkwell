# Wrytesmart

Enterprise-style writing practice app built with **Next.js** and **InsForge**. Analyse your writing, follow an adaptive curriculum, and track progress over time.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- InsForge project credentials (see `.env.example`)

### Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Client-side variables must use the `NEXT_PUBLIC_` prefix:

```env
NEXT_PUBLIC_INSFORGE_URL=https://your-appkey.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key_here

# Optional client-side GROQ fallback
# NEXT_PUBLIC_GROQ_API_KEY=gsk_your_key_here
```

Restart the dev server after changing `.env.local`.

### Build for production

```bash
npm run build
npm run start
```

## Project structure

```
src/
├── app/                    # Next.js App Router (layout, pages)
│   ├── layout.tsx
│   ├── page.tsx            # Main workspace
│   └── login/page.tsx      # Sign-in page
├── components/             # UI components
├── hooks/
├── lib/                    # API clients, InsForge, utilities
├── constants/
└── types.ts
functions/                    # InsForge edge functions (deploy separately)
```

## InsForge edge functions

```bash
npm run bundle-functions
# Deploy bundled functions via InsForge CLI
```

## License

Private — for personal use.
