# Inkwell

A single-user writing practice tool. Paste or type a sentence or paragraph, and Inkwell analyses your grammar and wording, then offers three rewrites at different complexity levels — simple, intermediate, and advanced — while preserving the exact same meaning.

## Features

- Grammar and wording feedback with plain-English explanations
- Three complexity rewrites (simple → intermediate → advanced)
- Live word count
- Rotating loading status messages
- Copy buttons for each rewrite
- Fully client-side — no backend, no database, no authentication

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- A [GROQ API key](https://console.groq.com/keys)

### Run locally

```bash
npm install
cp .env.example .env   # optional — for local dev convenience
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

For local development you can put your key in `.env`:

```env
VITE_GROQ_API_KEY=gsk_your_key_here
```

Vite only exposes variables prefixed with `VITE_` to the browser. Restart the dev server after changing `.env`.

### Build for production

```bash
npm run build
npm run preview
```

## Deploy on Vercel

A `.env` file in your repo is **not** used by Vercel (and should stay gitignored). Set the key in the Vercel dashboard instead:

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**
2. Add a variable named **`VITE_GROQ_API_KEY`** with your `gsk_…` key  
   (Vite also accepts **`GROQ_API_KEY`** as a fallback name.)
3. Enable it for **Production** (and Preview if you want)
4. **Redeploy** the project — env vars are baked in at **build time**, so changing them requires a new deploy

After a successful deploy with the variable set, the API key panel is hidden and **Analyse my writing** works immediately.

If the variable is missing, paste your key in the toolbar and click **Analyse** (you do not need **Save for session** first).

**Security note:** A key set as a Vite env var is included in the client JavaScript bundle. Anyone can view it in browser devtools. Use this only for personal deployments, or paste the key manually per session instead.

## GROQ API key

1. Sign up at [console.groq.com](https://console.groq.com/)
2. Create an API key under **API Keys**
3. Paste the key into Inkwell and click **Save for session**

### Privacy note

Without `.env`, your API key is held **only in React state (in-memory) for the current browser tab** and cleared on reload.

If you use `.env` for local dev, the key is embedded in the client bundle at build/dev time (standard Vite behavior). It is still:

- **Never** saved to `localStorage`, `sessionStorage`, or cookies
- **Never** sent anywhere except directly to GROQ's API (`https://api.groq.com`) from your browser

Do not commit `.env` or deploy a production build with a real key baked in. Treat the key like a password.

## Supported models

- `llama-3.3-70b-versatile` (default)
- `llama-3.1-8b-instant`
- `gemma2-9b-it`

## Project structure

```
src/
├── App.tsx                 # Top-level state and layout
├── types.ts                # Shared TypeScript types
├── lib/
│   └── groqClient.ts       # GROQ API calls and response parsing
└── components/
    ├── ApiKeyPanel.tsx     # API key input and model selector
    ├── Editor.tsx          # Text area, word count, analyse button
    ├── FeedbackCard.tsx    # Grammar/error feedback
    └── VersionLadder.tsx   # Simple / intermediate / advanced rewrites
```

## License

Private — for personal use.
