---
name: carloha-marketing-hub-maintainer
description: Maintain, debug, improve, and extend the Carloha Marketing Hub repository. Use when work involves this repo's Next.js app, UI/page edits, bilingual English/Chinese copy, Carloha Nigeria or Chery marketing resources, request forms, Google Drive or Google Sheets material links, Vercel deployment, build/test failures, GitHub commits or PRs, PDF/user-guide resources, or automotive marketing content inside this project.
---

# Carloha Marketing Hub Maintainer

## Project Purpose

Carloha Marketing Hub is an internal marketing resource and support website for Carloha Nigeria and Chery-related marketing work. It organizes vehicle materials, product resources, campaign information, request forms, media assets, training materials, dealer guidance, and internal marketing support content.

Keep the site easy for non-technical marketing staff, sales teams, and dealers to navigate. Treat Google Drive and external links as the material storage layer, and the Next.js app as the searchable, bilingual access and support interface.

## Start Every Task

Before editing, inspect the current repo state and the relevant files. Prefer these entry points:

```bash
git status --short --branch
rg --files
nl -ba package.json
nl -ba lib/config.js
nl -ba lib/siteCopy.js
```

Read the route, component, config, style, test, or doc files related to the user's request before guessing. Reuse existing components, styles, routes, and data helpers whenever possible.

## Actual Repo Structure

- `app/`: Next.js App Router pages, API routes, root layout, and global CSS.
- `app/page.js`: home page, hero, global search, overview stats, latest updates, support callout.
- `app/vehicles/page.js` and `app/vehicles/[slug]/page.js`: vehicle listing and detail pages.
- `app/general/page.js`: general material libraries.
- `app/request/page.js`: request/support page.
- `app/guidelines/page.js`: usage rules.
- `app/updates/page.js`: latest material updates.
- `app/insights/page.js`: private analytics dashboard.
- `app/api/request/route.js`: request submission endpoint.
- `app/api/assistant/route.js`: Gemini-backed Carloha AI endpoint.
- `app/api/analytics/route.js`: lightweight event collection endpoint.
- `components/`: shared UI including `Sidebar`, `SearchBox`, filters, cards, request form, material buttons, language toggle, page tracker, and assistant.
- `lib/`: config, data loading/normalization, seed data, translations, assistant index, analytics, logging, validation, and rate limiting.
- `public/`: logo, banner, and vehicle images.
- `docs/`: bilingual HTML/PDF user guides and Google Apps Script request-form receiver.
- `tests/`: Node test files for data, request validation/routes, assistant route/index, and analytics.
- `README.md` and `DEPLOYMENT_GUIDE_ZH.md`: setup/deployment docs; verify against code before trusting env var names.

## Common Tasks

- Add or revise pages in `app/` using the existing App Router style.
- Update bilingual UI copy in `lib/siteCopy.js` and value translations in `lib/translations.js`.
- Update vehicle/general material behavior through `lib/data.js`, `lib/seedData.js`, `components/FilterableVehicleMaterials.js`, `components/FilterableGeneralMaterials.js`, and `components/MaterialButton.js`.
- Update request form fields, validation, and submission flow through `components/RequestForm.js`, `components/RequestForm.module.css`, `lib/requestValidation.js`, `app/request/page.js`, and `app/api/request/route.js`.
- Update Carloha AI behavior through `components/MarketingAssistant.js`, `components/MarketingAssistant.module.css`, `lib/assistantIndex.js`, and `app/api/assistant/route.js`.
- Update user-facing guides in `docs/*.html`; if a PDF is requested or already exists for the same guide, re-export the matching `docs/*.pdf`.
- Fix Next.js build errors by locating the exact file, line, JSX/import/runtime cause, then making the smallest safe edit.

## Development Workflow

Use the actual scripts from `package.json`:

```bash
npm run dev
npm test
npm run build
npm start
```

Current verified validation:

- `npm test` passes the Node test suite.
- `npm run build` succeeds for the current app.

Known script issue:

- `npm run lint` currently runs `next lint` and may fail with `Invalid project directory provided .../lint` under this Next.js setup. Do not rely on lint as a passing validation command until the script is fixed.

For frontend work, run or use the dev server when visual verification matters. After meaningful UI changes, verify the affected page in a browser if practical and check mobile-responsive behavior.

## UI And Content Style

- Keep the UI clean, modern, professional, and suited to an internal automotive marketing hub.
- Follow the existing warm orange Carloha visual system in `app/globals.css` (`--orange`, `--orange-action`, light warm backgrounds, white panels, restrained borders).
- Preserve the sidebar/navigation model, language toggle behavior, assistant placement, card patterns, search/filter patterns, and responsive layout unless the user asks for a redesign.
- Make pages scannable for non-technical marketing users: clear headings, direct actions, simple filters, obvious request paths.
- Prefer simple, maintainable React and CSS over clever abstractions.
- Avoid adding heavy dependencies unless the user need clearly justifies them.
- Do not add invented product claims, vehicle specs, prices, awards, launch dates, warranty terms, or official claims.
- For marketing copy, use benefit-led language but avoid exaggerated claims.
- Preserve official brand names, model names, file names, and product names exactly as provided.

## Bilingual English/Chinese Rules

- Keep English and Chinese UI copy aligned. Most shared copy lives in `lib/siteCopy.js`; common value translations live in `lib/translations.js`.
- Use `EN` and `CN` keys consistently when extending existing copy structures.
- English should be professional, natural, and not overly Chinese-style.
- Chinese should be clear, businesslike, and match the actual product UI labels.
- Confirm localized labels before updating guides or screenshots. Current navigation includes `Home` / `首页`, `Vehicle Materials` / `车型资料`, `General Materials` / `通用资料`, `Q&A / Request` / `问题与需求`, and `Usage Guidelines` / `使用规范`.
- For Chinese docs, mirror the actual or user-approved Chinese UI wording. Prior guide work specifically changed Chinese `Home` references to `首页`.
- Clarify that `Ready` and `Coming Soon` are statuses, while labels such as `Brochures`, `Official Photos`, and `Training Materials` are material types.

## File And Asset Organization

- Put route UI in `app/<route>/page.js` and shared UI in `components/`.
- Put cross-route data, config, validation, normalization, analytics, and assistant logic in `lib/`.
- Put images in `public/`; use stable public paths such as `/logo.png`, `/banner/...`, and `/vehicles/...`.
- Keep generated user-guide source files and PDFs under `docs/`.
- Do not rename routes, files, public URLs, environment variable names, or public asset paths unless necessary and user-approved.
- Do not remove existing content unless the user explicitly asks. If replacing content, preserve any business-critical names, links, and bilingual coverage.

## Material Links And Requests

- Material links usually point to Google Drive folders/files. Verify changed links when practical.
- Google Sheets CSV data is normalized in `lib/data.js` and falls back to `lib/seedData.js`.
- Current code-confirmed CSV environment variables are:

```bash
NEXT_PUBLIC_VEHICLE_MATERIALS_CSV
NEXT_PUBLIC_GENERAL_MATERIALS_CSV
```

- Older docs may mention `NEXT_PUBLIC_VEHICLE_CSV_URL` and `NEXT_PUBLIC_GENERAL_CSV_URL`; trust current code unless the user asks to migrate names.
- `Coming Soon` or empty material links should route users toward `/request`, using the existing `MaterialButton` behavior.
- Request types include new material requests, broken link reports, product questions, marketing execution questions, and other requests.
- Request submissions require `REQUEST_FORM_SUBMIT_URL`; the Apps Script receiver template is `docs/google-apps-script-request-form.js`.
- If changing forms, links, or resource paths, verify the final URLs and ensure request prefill behavior still works.

## Build, Testing, And Deployment

- Before deployment or PR handoff, run `npm test` and `npm run build` when code changes affect app behavior.
- Before Vercel deployment, check for common Next.js issues: syntax errors, invalid JSX nesting, duplicated render/map blocks, missing imports, client/server component mistakes, bad dynamic route assumptions, bad environment variables, and invalid external links.
- The project is Vercel-ready and documented as a GitHub -> Vercel deployment. Vercel should auto-detect Next.js.
- Environment/config values currently include `REQUEST_FORM_URL`, `REQUEST_FORM_EMBED_URL`, `REQUEST_FORM_SUBMIT_URL`, `ANALYTICS_SUBMIT_URL`, `ASSISTANT_MODEL`, `GEMINI_API_KEY`, `INSIGHTS_ACCESS_KEY`, and the two `NEXT_PUBLIC_*_MATERIALS_CSV` variables.
- `/insights` is protected by `INSIGHTS_ACCESS_KEY` via `proxy.js`.
- The assistant falls back gracefully if `GEMINI_API_KEY` is missing; do not hard-code keys.

## GitHub And PR Workflow

- Keep changes focused and avoid unrelated refactors.
- Use clear commit messages that name the user-visible or maintenance outcome.
- If opening a PR, include a concise summary and testing notes such as `npm test` and `npm run build`.
- Do not commit generated, unrelated, or local-only files unless they are part of the requested artifact.
- Treat user edits in the working tree as intentional. Do not revert them unless explicitly asked.

## Safety Rules

- Inspect the relevant route/component/config/style/test files before editing.
- Make the smallest change that solves the request while preserving current pages and links.
- Do not invent business facts or official vehicle/product claims.
- Do not rename public routes or environment variables casually; deployment and docs may depend on them.
- Do not break bilingual behavior: update both languages or explain why only one language is changed.
- Preserve Google Drive link behavior and request fallback behavior for unavailable materials.
- Keep non-technical staff in mind: avoid hidden workflows, confusing labels, and developer-only language in user-facing UI.
- If fixing build errors, identify the exact file, line, and cause before editing.

## Known Problems And Debugging

- `npm run lint` may fail due to the current `next lint` script; use `npm test` and `npm run build` as primary validation until fixed.
- README/deployment docs may contain stale CSV env var names; verify against `lib/config.js`.
- Request submission returns a configuration error if `REQUEST_FORM_SUBMIT_URL` is unset.
- Assistant API behavior depends on `GEMINI_API_KEY`; 400 responses may trigger model fallback, while 401/403/429/server errors produce user-facing messages.
- CSV fetch failures fall back to seed data and log warnings.
- Ready material rows without links should be treated as data issues and corrected in Sheets/seed data.
- Prior project history includes user-guide PDF generation from HTML. System PDF conversion was unreliable; Chrome headless printing was the proven export path.
- Prior project history includes DeepSeek review of the bilingual guides. Useful accepted findings were status-vs-type clarification, clearer Coming Soon -> Request flow, AI request draft confirmation, and concrete support contact info.

## Relationship With Global Rules And Model Routing

This repo skill is project-specific. Use it together with the user's global `AGENTS.md` and global `external-model-routing` skill.

For ordinary repo edits, Codex should work directly. For low-cost second opinions on long text, documents, PPT/PDF summaries, translations, and broad code review, follow the global routing rules and use DeepSeek as appropriate. For long-context, visual, screenshot, browser, or multimodal tasks, follow the global routing rules and use Gemini as appropriate. Do not use Kimi unless the user explicitly requests it.

Do not duplicate the full global routing instructions here. If global rules and this repo skill conflict, prefer this repo skill for project-specific file paths, commands, routes, and deployment details; prefer global rules for model selection.

## Precedence

- Project-specific facts in this repo skill override generic global advice.
- Global `AGENTS.md` controls cross-project working style and default working preferences.
- `external-model-routing` controls how to ask other models for second opinions.
- Do not create duplicate skills with the same name.
- Do not duplicate long routing instructions inside this repo skill.

## When Uncertain

Inspect the repo before guessing. Check current files, tests, routes, environment variable usage, and user-visible copy. If memory or docs conflict with code, trust the current code for implementation details and mention any doc mismatch that should be cleaned up.
