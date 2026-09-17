# WhisperNet — Anonymous Messaging

WhisperNet lets anyone create a personal profile link, share it anywhere, and receive honest **anonymous messages** in a private dashboard.

Built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui + NextAuth (credentials/JWT) + Mongoose + Resend + Gemini AI**.

## How it works

```
Sign up → Verify email code → Sign in → Dashboard → Share /profile/[username] → Receive anonymous messages
```

1. **Sign up (`/sign-up`)** — username + email + password. Username uniqueness is checked live (debounced `GET /api/check-username-unique`). Password is hashed with `bcryptjs`. A 6-digit code (10 min expiry) is emailed via Resend.
2. **Verify (`/verify/[username]`)** — `POST /api/verify-code` activates the account (`isActive: true`).
3. **Sign in (`/sign-in`)** — NextAuth Credentials provider (`src/app/api/auth/[...nextauth]/option.ts`). Allows email or username, blocks unverified accounts, stores `_id / username / isActive / isAcceptingMessage` in JWT.
4. **Dashboard (`/dashboard`, protected by `src/proxy.ts`)** — inbox sorted newest-first via Mongo aggregation (`GET /api/get-messages`), copy profile link, toggle `isAcceptingMessage` (`POST/GET /api/accept-message`), delete (`DELETE /api/delete-message/[messageid]`).
5. **Public profile (`/profile/[username]`)** — anyone can send a message without login (`POST /api/send-message`, Zod-validated, max 500 chars). “Suggest” button calls `POST /api/suggest-messages` (Gemini, server-side fixed prompt).
6. **Home (`/`)** — hero + how-it-works + message carousel with Framer Motion entrance, scroll reveals, cursor glow.

### Key API routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/sign-up` | no | create/in-update unverified user, send code |
| POST | `/api/verify-code` | no | activate account |
| GET | `/api/check-username-unique?username=` | no | live availability check |
| POST | `/api/send-message` | no | anonymous send (checks active + accepting) |
| GET | `/api/get-messages` | yes | inbox, newest first |
| GET/POST | `/api/accept-message` | yes | read/update accepting toggle |
| DELETE | `/api/delete-message/[messageid]` | yes | delete one message |
| POST | `/api/suggest-messages` | no | Gemini ice-breakers (fixed prompt) |

### Data model (`src/model/User.ts`)

`User { username (unique), email (unique), password (hashed), verifyCode, verifyCodeExpire, isActive, isAcceptingMessage, messages: [{ content, createdAt }] }` + timestamps.

`src/lib/dbConnect.ts` caches the Mongoose connection for HMR/serverless reuse.

## Getting started

Requirements: **Node >= 26.9.0** (see `.nvmrc`), npm >= 11.

```bash
nvm use        # or use Node 26.9.0
npm install
cp .env.example .env.local
npm run dev    # http://localhost:3000
```

Fill `.env.local`:

```env
MONGODB_URI="mongodb://localhost:27017/whisper"
RESEND_API_KEY="..."
EMAIL_FROM="onboarding@resend.dev"
NEXTAUTH_SECRET="..."   # `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="..."
```

Other commands:

```bash
npm run build   # production build (Turbopack)
npm start       # serve production build
npm run lint    # eslint
```

Demo credentials shown on `/sign-in` (`admin12 / password`) only fill the form — login still requires a real verified user in MongoDB.

## What's good (senior review)

- Clear App Router split: `(auth)` / `(app)` / `profile` / `api`.
- Validation on both sides with Zod (`src/schemas/`), shared with server routes.
- Good UX details: debounced availability check with cancellation, `stopOnMouseEnter` carousel, toasts, dark mode.
- Sensible backend guards: unverified login blocked, `isAcceptingMessage` enforced server-side, session userId validated as ObjectId, duplicate-key (11000) handled on sign-up.
- AI cost/abuse guard: client prompts ignored, fixed server prompt in `suggest-messages`.
- Serverless-safe Mongoose caching.

## Recommended next (what I'd add)

1. **Security / abuse** — rate-limit `send-message`, `sign-up`, `suggest-messages` (e.g. Upstash); add CAPTCHA/Turnstile on public send; profanity/PII filter + report button. Remove demo credential hint before production.
2. **Auth completeness** — forgot/reset password, resend-code cooldown, migrate NextAuth v4 → Auth.js v5, `secure` cookie + `NEXTAUTH_URL` check per env.
3. **Data & scale** — ensure Mongo indexes (`username`, `email`), paginate inbox (currently full aggregation), add message ownership check test on delete.
4. **Reliability** — add tests (Vitest + Playwright for signup→verify→send flow), error monitoring (Sentry), structured logging instead of `console.error`.
5. **DX** — `env` validation with `@twin/zod-env` or `createEnv`, seed script (`npm run db:seed`), CI with `lint + tsc + build`.
6. **Product** — message search, mute/block words, public profile QR share, email notifications toggle.

## Project structure (short)

```
src/app/(auth)/sign-in|sign-up|verify/[username]  auth pages
src/app/(app)/dashboard                           private inbox
src/app/profile/[username]                        public send page
src/app/api/...                                   REST routes (see table)
src/model/User.ts  src/lib/dbConnect.ts           Mongoose
src/schemas/       src/components/ui/             Zod + shadcn/ui
src/proxy.ts                                      auth redirect guard
```
