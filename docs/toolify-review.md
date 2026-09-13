# Toolify-linked tools — manual review backlog

These 27 tools still point at `toolify.ai` aggregator pages. Each needs an editor to
confirm the real official website (or mark the entry for removal).

**Policy:** per `docs/DATA_POLICY.md`, official URLs must be owned by the product vendor.

## How to resolve

1. Search for the product name; confirm the official domain (product site, not a review/aggregator page).
2. Edit `data/apps.json` → set `websiteUrl` to the official URL, append `; 官网人工确认 YYYY-MM-DD` to `adminNotes`.
3. Re-run `node scripts/import-legacy-to-db.mjs` and redeploy.

## Backlog

| # | Tool | Current slug | Suggested domain (unverified) | Notes |
|---|---|---|---|---|
| 1 | Nano Banana AI Image Editor | nano-banana-ai-image-editor-edit-photos-with-text | — | Google Gemini image model via third parties; verify actual product site |
| 2 | GeminiGenAI | geminigenai | geminigenai.com? | verify |
| 3 | A2E Free and Uncensored AI Videos | a2e-free-and-uncensored-ai-videos | a2e.ai? | verify |
| 4 | MindVideo AI | mindvideo-ai | — | verify |
| 5 | LIveX AI | livex-ai | — | verify |
| 6 | Clever AI Humanizer | clever-ai-humanizer | — | verify |
| 7 | Grok AI assistant | grok-ai-assistant | grok.x.ai (xAI) | verify; may be a wrapper listing |
| 8 | AdpexAI | adpexai | adpexai.com? | verify |
| 9 | Marble | marble | — | name too generic; consider removal |
| 10 | Anything | anything | — | name too generic; consider removal |
| 11 | X-Design | x-design | — | verify |
| 12 | innerai.com | innerai-com | innerai.com? | verify |
| 13 | LitVideo | litvideo | — | verify |
| 14 | Toolsmart Free Humanize AI | toolsmart-free-humanize-ai | — | low-quality SEO tool; consider removal |
| 15 | Free Paraphrasing Tool-Toolsmart | free-paraphrasing-tool-toolsmart | — | low-quality SEO tool; consider removal |
| 16 | wondershare.net | wondershare-net | wondershare.com (brand) | verify which product |
| 17 | Rubii | rubii | — | verify |
| 18 | nim video | nim-video | — | verify |
| 19 | Grok Imagine | grok-imagine | — | xAI feature; verify standalone site |
| 20 | Magic-Eraser | magic-eraser-1 | magiceraser.ai? | verify |
| 21 | Fluently AI | fluently-ai | fluently.so? | verify |
| 22 | ParakeetAI | parakeetai | — | verify |
| 23 | Veo3 AI- | veo3-ai-2 | — | Google Veo wrapper; verify |
| 24 | Lovart | lovart | lovart.ai? | verify |
| 25 | PTE APEUni | apeuni-com | apeuni.com? | verify |
| 26 | Astra AI | astra-ai | — | verify |
| 27 | Alpha Arena | alpha-arena | — | verify |

## Removed from the catalog (2026-08)

- Meta Segment Anything Model 2 — open-source model library, not a product
- Meta AI Demos — demo collection, not an independent product
- Fish Speech — open-source model without a product site
- Nudify by FunFun.ai / funfun.ai — NSFW tools, not suitable for a general directory
- Free YouTube to MP3 Converter — copyright-risk tool
