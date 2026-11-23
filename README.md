# Pa's Place website

The public website and staff admin portal for Pa's Place NPC, Pennington, KwaZulu-Natal.

- **[Astro 7](https://astro.build)** on Node (standalone adapter). Every page is rendered on request from the database, so an edit in the admin portal is live at once.
- **[Tailwind CSS v4](https://tailwindcss.com)**, with the brand tokens in [src/styles/global.css](src/styles/global.css).
- **Postgres** through [Drizzle ORM](https://orm.drizzle.team). With no `DATABASE_URL` it runs embedded ([PGlite](https://pglite.dev)), so there is nothing to install.
- **React** for one island only: the booking form.

Design documents are in [docs/superpowers/specs/](docs/superpowers/specs/). The brand identity ("The Garden by the Sea") is specified in [2026-11-17-brand-identity.md](docs/superpowers/specs/2026-11-17-brand-identity.md).

## Run it

```bash
npm install
npm run dev
```

- Website: http://localhost:4321
- Admin portal: http://localhost:4321/admin

On the first request the server creates the database, loads the photos in `seed/photos/` and the starter content, and creates a local development owner. Use `admin` and the development password, or set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first run. To start again from scratch, stop the server and run `npm run db:reset`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Unit and service tests (in-memory database) |
| `npm run check` | Type-check |
| `npm run build` / `npm start` | Production build and server |
| `npm run db:generate` | Create a migration after changing `src/server/db/schema.ts` |
| `npm run db:reset` | Delete the local database and uploaded photos |

## The admin portal

| Area | What staff can do |
|---|---|
| Dashboard | New enquiries, booking requests to answer, next arrivals, recent activity |
| Enquiries | Inbox of contact-form messages: status, assignee, internal notes, search, CSV export |
| Bookings | Requests from the website and bookings added by staff; confirm, decline, cancel, mark the deposit paid |
| Calendar | Month view by booking option; block dates for maintenance or sponsored holidays |
| Content | Site settings, page copy, booking options and rates, grounds features, gallery, FAQs |
| Photos | Upload, describe and categorise photos; flag those that still need consent |
| Staff | Accounts and roles (owner, admin, editor, viewer), password resets |
| Activity | Audit trail of who did what |

How bookings work: a guest picks dates against live availability and sends a request. The dates are held immediately. Staff confirm or decline, the guest pays the deposit by EFT, and staff mark it as received. **There is no online card payment**; put banking details in *Content → Site settings → How to pay the deposit*.

Security: passwords are hashed with scrypt; sessions are server-side with httpOnly cookies; accounts lock after five wrong passwords; cross-site form posts are rejected; public forms are rate-limited and carry a honeypot; uploads are re-encoded and stripped of metadata.

## Deploying (Railway)

`railway.json` builds with `npm run build` and starts `node ./dist/server/entry.mjs`.

1. **Add a volume** to the service (for example at `/data`). The app uses Railway’s mount path for the database and uploaded photos by default. If `DATA_DIR` or `MEDIA_DIR` is already set, point it to an absolute path on that volume. Without a volume, local files are lost on redeploy.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10 characters or more) for the first owner account.
3. Optional: add Railway's Postgres and set `DATABASE_URL` to use it instead of the embedded database. Photos still need the volume.
4. Optional: set the `SMTP_*` variables and `SITE_URL` to email staff and guests about new enquiries and bookings.

See [.env.example](.env.example) for every variable. Run a single instance: rate limiting and the content cache are per process.

## Project structure

```
seed/photos/          real photos, sorted by category, loaded on first run
drizzle/              SQL migrations (applied automatically at start-up)
src/
  pages/              public routes, /admin, /api, /media
  components/         site sections, UI pieces, booking form, storybook scenes
  layouts/            Layout (public) and AdminLayout
  server/
    db/               schema and database client
    auth/             password hashing, sessions, roles
    services/         content, media, enquiries, bookings, users, mail, audit trail
    lib/              dates, pricing, ids, rate limiting
  styles/             global.css (brand), admin.css, story.css (/our-story only)
tests/
```
