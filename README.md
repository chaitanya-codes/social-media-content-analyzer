# PostLens

PostLens is a local/server-side social media content analyzer. Upload a selectable-text PDF or an image of a draft, extract the content, and get explainable signals for the hook, clarity, readability, CTA, interaction, and hashtag usage.

## Features

- Drag-and-drop and keyboard-accessible file upload for PDF, PNG, JPG/JPEG, and WebP.
- 10 MB client/server validation with human-friendly errors.
- PDF text extraction with whitespace normalization.
- Tesseract.js OCR for screenshots and photographed documents.
- Deterministic analysis with evidence-backed signal explanations and contextual recommendations.
- Sample post, processing states, responsive results view, and copyable suggested draft.

## Architecture

The Next.js App Router page owns interaction state. `app/api/analyze/route.ts` is the typed multipart boundary and delegates validation, extraction, normalization, and analysis to `lib/`. The analysis engine is pure TypeScript so it can be tested without a browser or external service.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Production verification uses `npm run build` followed by `npm start`.

## Analysis approach

Scores are directional averages of six signals. They use observable properties such as sentence length, opening structure, questions, CTA language, and hashtag count. Recommendations explain the detected condition and suggest a concrete edit. No engagement outcome is predicted.

## Design decisions and limitations

Uploads are processed in memory and are not persisted or sent to an external AI provider. OCR is CPU-intensive and may be slow on serverless deployments; production deployments should set appropriate function limits. Scanned PDFs with no selectable text are reported as unreadable rather than silently analyzed. The sample is intentionally local and does not represent a real person or company.

## Project structure

`app/` contains the UI and API route. `components/` is intentionally not needed for the current focused surface. `lib/extraction` contains normalization, `lib/validation` contains file checks, `lib/analysis` contains the deterministic engine and tests, and `types/` contains domain types.

## Future improvements

Add PDF OCR fallback, richer inline highlights, platform-specific modes, and background processing for larger OCR jobs.
