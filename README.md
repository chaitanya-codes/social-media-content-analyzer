# PostLens

PostLens is a local/server-side social media content analyzer. Upload a selectable-text PDF or an image of a draft, extract the content, and get explainable signals for the hook, clarity, readability, CTA, interaction, and hashtag usage.

## Features

- Drag-and-drop and keyboard-accessible file upload for PDF, PNG, JPG/JPEG, and WebP.
- 10 MB client/server validation with human-friendly errors.
- PDF text extraction with whitespace normalization.
- Tesseract.js OCR for screenshots and photographed documents.
- Deterministic analysis with evidence-backed signal explanations and contextual recommendations.
- Interactive evidence highlights tied to analyzer text ranges.
- Read/Analyze mode with separate detected-content and actionable-finding treatments.
- Context panels for recognized hashtags, mentions, links, questions, and emojis.
- Contextual fix preview with safe deterministic replacements and immediate re-analysis.
- Sample post, processing states, responsive results view, and copyable current draft.
- Optional server-side Gemini semantic analysis with platform detection for Instagram, LinkedIn, X, and Facebook screenshots.

## Architecture

The Next.js App Router page owns interaction state. `app/api/analyze/route.ts` is the typed multipart boundary and delegates validation, extraction, normalization, and analysis to `lib/`. The analysis engine is pure TypeScript so it can be tested without a browser or external service.

When `GEMINI_API_KEY` is configured, the same API route sends the normalized post to the official Google GenAI SDK using a configurable Gemini Flash model. Images may also be sent as inline image data for screenshot-aware semantic analysis. The key remains server-side. No Gemini request is made when the key is absent.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Production verification uses `npm run build` followed by `npm start`.

## Analysis approach

Scores are directional averages of six signals. They use observable properties such as sentence length, opening structure, questions, CTA language, and hashtag count. Content entities are separately detected for hashtags, mentions, links, questions, and emojis. Attention findings carry verified ranges into the original text, so a highlight is never positioned from a hardcoded sample assumption. The UI connects a finding to its explanation, previews only bounded deterministic fixes, applies the change in place, and re-runs the analyzer. No engagement outcome is predicted.

Gemini is used only for semantic concerns such as hook quality, contextual clarity, tone, and platform-aware recommendations. Its response is constrained to structured JSON. AI findings are accepted only when their evidence is an exact substring of the extracted text; otherwise they are omitted rather than highlighted. Provider errors, missing keys, timeouts, malformed JSON, and schema failures fall back to the deterministic analysis.

## Design decisions and limitations

Uploads are processed in memory and are not persisted. With `GEMINI_API_KEY` configured, normalized text and, for image uploads, the original image bytes are sent to Google for semantic analysis. Without the key, no external provider receives document content. OCR is CPU-intensive and may be slow on serverless deployments; production deployments should set appropriate function limits. Scanned PDFs with no selectable text are reported as unreadable rather than silently analyzed. The sample is intentionally local and does not represent a real person or company.

## Project structure

`app/` contains the UI and API route. `components/results/` contains the interactive text, finding detail, and fix preview surfaces. `lib/extraction` contains normalization, `lib/validation` contains file checks, `lib/analysis` contains the deterministic engine and tests, and `types/` contains domain types.

## Future improvements

Add PDF OCR fallback, richer finding types, platform-specific modes, and background processing for larger OCR jobs.
