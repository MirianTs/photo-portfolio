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
