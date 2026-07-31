# Converge — AI Chat App

A full-stack AI chat application built with Next.js, Supabase (auth + database), and Groq (AI responses).

## Status

| Phase | Contents | Status |
|---|---|---|
| 1 | Splash, Welcome, Sign Up, Sign In, Forgot Password, Google Login | Done |
| 2 | Home Dashboard, Sidebar, Profile, Settings | Done |
| 3 | Chat UI, AI responses (Groq), streaming, chat history, search | Done |
| 4 | File upload, code blocks, markdown, error handling | Done |
| 5 | Performance, security, testing, deployment | Guidance below |

---

## 1. One-time setup

### 1a. Install dependencies
```bash
npm install
```

### 1b. Environment variables
Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
GROQ_API_KEY=your-groq-api-key
```

- Supabase values: Project Settings -> API Keys
- Groq key: console.groq.com/keys

### 1c. Database schema (required for Chat/Phase 3)
1. Open your Supabase project -> SQL Editor -> New query
2. Paste the entire contents of `supabase/phase3_chat_schema.sql`
3. Click Run

This creates the `conversations` and `messages` tables with Row Level Security, so each user can only ever see their own chat history.

### 1d. Google Login (optional but included in Phase 1)
In Supabase dashboard -> Authentication -> Providers -> Google:
- Enable it
- Add your Google OAuth Client ID + Secret (from Google Cloud Console)
- Set the authorized redirect URI to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### 1e. Email confirmation (dev convenience)
By default Supabase requires email confirmation on sign-up. For faster local testing, you can turn this off:
Authentication -> Providers -> Email -> toggle off "Confirm email".
Turn it back on before going live so real users must verify a real email address.

---

## 2. Run locally
```bash
npm run dev
```
Visit http://localhost:3000 (or whatever port your terminal shows).

---

## 3. Security checklist (Phase 5)
- Row Level Security enabled on all tables - users can only read/write their own data
- Groq API key is server-side only (used in /api/chat, never sent to the browser)
- Supabase anon/publishable key is safe to expose client-side by design (protected by RLS)
- Auth session refresh handled centrally in middleware
- Protected routes (/dashboard, /profile, /settings, /chat) redirect to sign-in if not authenticated
- Before production: turn email confirmation back on, review Supabase rate limits, add a custom SMTP provider (e.g. Resend) so you're not capped by Supabase's default email sender

## 4. Performance notes
- Chat responses stream token-by-token (no waiting for the full response)
- Conversation list and messages are fetched only when needed, not preloaded in bulk
- Route groups keep the authenticated shell (Sidebar) from re-rendering between Dashboard/Chat/Profile/Settings

## 5. Known limitations / good next steps
- File upload only supports text-based files (.txt, .md, .csv, .json) up to 1MB - no image/PDF parsing yet, and files aren't stored in Supabase Storage (they're only read into the current message)
- No automated tests yet (unit/integration/E2E) - recommended before scaling further
- Chat search is client-side title matching only; a full-text search over message content would need a Postgres tsvector index

---

## 6. Deployment (recommended: Vercel)
1. Push this project to a GitHub repo
2. Go to vercel.com -> New Project -> import your repo
3. Add the same environment variables from .env.local in Vercel's project settings
4. Deploy
5. In Supabase -> Authentication -> URL Configuration, add your production URL (e.g. https://your-app.vercel.app) to both Site URL and Redirect URLs, and update the Google OAuth redirect URI to match

Other supported hosts: Netlify, Railway, Render - the same environment variables and Supabase redirect URL updates apply.
