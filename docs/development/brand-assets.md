# Hermes Chat Brand Asset Inventory

This register centralizes the latest Hermes Chat visuals and highlights open design follow-ups.

## Generated assets

| Asset       | Path                                                                     | Source                                                                                    | Notes                                                            |
| ----------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Hero banner | `public/assets/hermes-chat/banner.svg`                                   | Hand-authored SVG gradient; downstream CDNs can rasterize as needed                       | Update gradient copy when marketing publishes official hero art. |
| Logo mark   | `public/assets/hermes-chat/logo.svg`                                     | Hand-authored SVG with gradient base and wing motif                                       | Replace with final vector export from brand studio when ready.   |
| Wordmark    | `public/assets/hermes-chat/wordmark.svg`                                 | Hand-authored SVG using system fonts                                                      | Swap for official typography once licensing clears.              |
| Favicon     | `public/assets/hermes-chat/favicon.svg`                                  | Minimal SVG glyph designed for automated favicon packaging                                | Ensure multi-size ICO package ships in desktop build pipeline.   |
| OG image    | `public/og/hermes-chat-cover.svg` (mirrored to `public/og/cover.svg`)    | Vector OG layout meant to be rasterized during deployment                                 | Integrate static build step that exports 1200×630 PNG for social crawlers. |

## Assets pending design refresh

- README feature illustrations under `image-feat-*` definitions still point to GitHub user attachments with LobeChat styling. (Tracked via README TODO comment.)
- Docs screenshots for BT Panel, plugin marketplace badges, and provider walkthroughs still reference legacy colorways.
- Mock plugin manifest links (`hermes-plugin-mock-credit-card`) are placeholders; design + integration teams must provision real assets.

## Localization & translation touchpoints

- Non-English locales need human verification after `bun run docs:i18n`; see [Translation follow-up](./rebranding.md#translation-follow-up).
- Support teams should reference this file when requesting new imagery or when auditing public marketing pages.
