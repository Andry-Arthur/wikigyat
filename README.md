# Wikigyat

Wikigyat is a browser-based prototype of a global creator platform where creators sell subscriptions, photos, and videos.

## Implemented features

- User authentication with **creator** and **subscriber** roles
- Creator profile setup with bio, profile photo, cover image, category, region, and configurable pricing tiers
- Subscription flow to unlock a creator feed
- Media upload and gallery for creator photo/video posts
- Locked previews with paywall prompts for non-subscribers
- Pay-per-view (PPV) purchases for individual posts
- Creator wallet dashboard with revenue, subscriber count, and payout history
- Search/discovery by category, popularity, and region
- Direct messaging between subscribers and creators they subscribe to
- Landing section with branding, featured creators, and sign-up CTA

## Run locally

```bash
npm start
```

Then open `http://localhost:4173`.

## Deployment (GitHub Pages)

This project is a fully static site (root `index.html` with `app.js` and `styles.css`), so no build step is required.

1. Ensure the GitHub Pages workflow is enabled (see `.github/workflows/deploy.yml`).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to the default branch (`main` or `master`) to trigger deployment.

The site will be available at:

```
https://<org-or-user>.github.io/wikigyat/
```

Because asset paths are relative, the app works when hosted from the repository subpath. If you use a custom domain, configure it in **Settings → Pages** and add a `CNAME` file at the repository root with your domain name.

### Validation checklist

- Landing hero renders and featured creators load
- Sign up / log in flow works
- Creator profile setup saves and displays
- Media gallery shows uploaded items and previews
