# Approach

PostLens uses a small Next.js App Router architecture. The browser validates file size and supported MIME types before sending a multipart request to `/api/analyze`, which repeats validation server-side. PDFs are parsed with `pdf-parse`; supported images are recognized with Tesseract.js. Both paths normalize whitespace and reject empty extraction so failures remain visible to the user.

The analyzer is a pure deterministic TypeScript function. It measures observable content properties—sentence and word counts, questions, CTA language, hashtags, mentions, links, emoji usage, and average sentence length—then turns those signals into explainable category scores. Recommendations are conditional, so a post with an existing CTA is not told to add one. The UI keeps the extracted post central and connects each score to an explanation and evidence.

Uploads are processed in memory and are not persisted or sent to an external AI service. The main tradeoff is that OCR is CPU-intensive; a production deployment should size serverless functions accordingly. The intentionally restrained interface uses a grid, monospace status labels, one accent color, and state-based motion to make the scan feel like a content instrument rather than a generic dashboard.
