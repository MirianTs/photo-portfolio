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

Requirements: Node.js 20 or newer.

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
   table and the bucket.
3. Create an admin user under Authentication > Users. Any signed-in user can
   manage photos, so only add accounts you trust.

## Admin panel

Open `/photo-portfolio/admin` (or `/admin` path on the dev server) and sign in
with the Supabase user. From there you can:

- upload one or more photos into a category,
- rename a photo's category,
- drag cards to change the gallery order,
- delete photos (removes both the file and the database row).
