# @sniff-dev/web

Minimal React web app for Sniff - handles landing page, authentication, and OAuth callbacks.

Part of the private [sniff-apps](https://github.com/sniff-dev/sniff-apps) repository.

## Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Structure

```
src/
├── pages/
│   ├── Landing.tsx          # Marketing landing page
│   ├── Auth.tsx              # CLI authentication
│   ├── OAuthCallback.tsx    # Linear OAuth callback
│   └── Dashboard.tsx        # Minimal dashboard
├── lib/
│   └── api.ts               # API client
├── App.tsx                  # Router setup
├── main.tsx                 # Entry point
└── index.css                # Tailwind imports
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

## How It Works

### CLI Auth Flow

1. CLI runs `sniff login`
2. Opens browser to `/auth?callback=http://localhost:31415`
3. User signs in
4. Web redirects to CLI with token

### OAuth Flow

1. CLI runs `sniff connect linear`
2. API generates Linear OAuth URL
3. Opens browser to Linear authorization
4. Linear redirects to `/oauth/linear/callback?code=...`
5. Web exchanges code for tokens via API
6. Shows success page

## Pages

- `/` - Landing page (marketing)
- `/auth` - CLI authentication
- `/oauth/linear/callback` - OAuth callback handler
- `/dashboard` - Minimal connection status (optional)

## Integration with API

All pages talk to `apps/api`:

- `POST /auth/login` - User authentication
- `POST /oauth/linear/callback` - OAuth token exchange
- `GET /agents` - List deployed agents (dashboard)

## Deployment

Build static files and deploy to:

- Vercel
- Netlify
- Cloudflare Pages
- Your own CDN

```bash
pnpm build  # Creates dist/
```
