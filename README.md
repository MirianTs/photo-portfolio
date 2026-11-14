# Photo Portfolio

Personal photography portfolio for Mirian Tsartsidze, built with React and Vite.
The live site is published on GitHub Pages at
<https://miriants.github.io/photo-portfolio/>.

The page has a hero section, a masonry photo gallery with category filters and a
lightbox, an about section and a contact section. Photos are stored in Supabase
and managed through a small admin panel.

## Tech stack

- [React 19](https://react.dev/) with [Vite](https://vite.dev/)
- [Supabase](https://supabase.com/) for the photo table, file storage and admin login
- [Oxlint](https://oxc.rs/) for linting
- GitHub Actions + GitHub Pages for deployment

## Getting started

Requirements: Node.js 20.19+ or 22.12+ (the versions Vite 8 supports; CI uses 22).

```sh
npm install
cp .env.example .env   # then fill in your Supabase project values
npm run dev
```

The dev server prints a local URL; the site is served under `/photo-portfolio/`
because of the `base` setting in `vite.config.js`.

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload |
| `npm run build`   | Build the production site into `dist/`    |
| `npm run preview` | Serve the built `dist/` folder locally    |
| `npm run lint`    | Run Oxlint over the project               |
| `npm test`        | Run the unit tests in `tests/` (node:test) |

## Environment variables

Both values come from the Supabase dashboard (Project Settings > API) and are
read at build time by Vite:

| Variable                 | Purpose                         |
| ------------------------ | ------------------------------- |
| `VITE_SUPABASE_URL`      | URL of the Supabase project     |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for the project |

Keep real values in `.env` (ignored by git), never in `.env.example`.

## Supabase setup

1. Create a public storage bucket named `photos` (Storage > New bucket).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the `photos` table and the row-level security policies for the
   table and the bucket. The script can be run again after it changes (for
   example to add the position index); existing policies are replaced.
3. Create an admin user under Authentication > Users. Any signed-in user can
   manage photos, so only add accounts you trust.

## Admin panel

Open `/photo-portfolio/admin` (the same path on the dev server) and sign in
with the Supabase user. From there you can:

- upload one or more photos into a category,
- rename a photo's category,
- drag cards to change the gallery order,
- delete photos (removes both the file and the database row).

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages. The workflow reads the Supabase values
from the repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
It also copies `index.html` to `404.html` so that direct visits to `/admin`
load the app instead of a GitHub 404 page.

## Project structure

```
index.html            HTML shell, meta tags and fonts
src/main.jsx          Entry point; picks the public site or the admin panel
src/App.jsx           Public page layout (sections)
src/components/       Navbar, Hero, Gallery, About, Contact, Reveal
src/admin/            Admin login and dashboard
src/lib/              Supabase client and small shared helpers
tests/                Unit tests for the helpers in src/lib (node --test)
supabase/schema.sql   Database table and access policies
public/               Static files copied as-is (favicons)
```
