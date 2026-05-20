# Carloha Marketing Hub

A Next.js / Vercel-ready website for Carloha's marketing resource library.

## What is included

- Multi-page website structure
- Vehicle Materials pages with individual vehicle detail pages
- General Materials page
- Latest Updates page
- Q&A / Request page
- Usage Guidelines page
- EN / 中文 interface toggle for key UI text
- Google Drive link support
- Google Sheets CSV-ready data layer with hardcoded seed fallback

## Quick start

1. Install Node.js LTS.
2. Open this folder in VS Code or Terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL shown in Terminal, usually `http://localhost:3000`.

## Google Sheets CSV connection

The website works with built-in seed data first. After you publish Google Sheets tabs as CSV, add these environment variables in Vercel:

```bash
NEXT_PUBLIC_VEHICLE_MATERIALS_CSV=your_vehicle_materials_csv_url
NEXT_PUBLIC_GENERAL_MATERIALS_CSV=your_general_materials_csv_url
```

If a CSV URL is empty or fails, the website uses the seed data in `lib/seedData.js`.

## Replace placeholders

- Replace `/public/logo.png` with the official PNG logo if needed.
- Replace contact details in `lib/config.js`.
- Replace `REQUEST_FORM_URL` and `REQUEST_FORM_EMBED_URL` in `lib/config.js` if the request sheet/form changes.
- Add `REQUEST_FORM_SUBMIT_URL` in Vercel after deploying the Google Apps Script web app in `docs/google-apps-script-request-form.js`.
- Add vehicle image links in the Google Sheet under `Vehicle Image`.
- Replace the banner placeholder in `app/page.js` when a multi-vehicle image is ready.

## Deploy to Vercel

1. Create a GitHub repository and upload this project.
2. Log in to Vercel and import the repository.
3. Use default Next.js settings.
4. Add environment variables if using Google Sheets CSV.
5. Deploy.

## Maintenance

Monthly workflow:

1. Update Google Drive folders/files.
2. Update the Google Sheet rows, links, and `Last Updated` values.
3. The website should refresh CSV content automatically based on the configured revalidation interval.
