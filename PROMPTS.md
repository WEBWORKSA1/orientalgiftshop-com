# OrientalGiftShop.com: phase-wise build prompts

Use these prompts in order to rebuild, extend or hand the project to another builder. Each phase is self-contained and lists its acceptance checks.

Global constraints for every phase:
- Static site, free GitHub Pages hosting from `main` (root). No server code, no paid services.
- AdSense client `ca-pub-6620975821265271`; script in `<head>` of every content page:
  `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6620975821265271" crossorigin="anonymous"></script>`
- Top of every page, linked to https://web.works/contact: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership".
- All forms deliver to the single site inbox via FormSubmit. The address is stored encoded in `assets/js/config.js` and never appears in page source, text or links.
- Original text and graphics only. Use "oriental" for objects and shops, never people.

---

## Phase 1: Strategy and information architecture

> Define OrientalGiftShop.com as an independent Asian gifting guide with free tools and a free B2B Gift Concierge (lead generation). Audience: people buying gifts for Chinese, Japanese, Korean, Indian, Vietnamese and Thai recipients, plus companies gifting clients and staff in Asia. Produce: sitemap (home, gift finder, gift ideas, guides index + 12 guides, festivals, taboo checker, lucky amount calculator, zodiac matcher, symbolism dictionary, greetings phrasebook, videos, news, concierge, for-sellers, advertise, support, contests, careers, about, contact, editorial policy, privacy, terms, disclaimer, trademark & copyright, thank-you, search, 404), monetisation map per page, and the festival calendar for the next three years.

Checks: every page has one primary CTA; the concierge is reachable in one click from every page.

## Phase 2: Design system and layout

> Build a responsive design system in one CSS file: palette ink #1c1a2e, lacquer red #b3261e, gold #c99a2e, jade #2f7d6d, paper #fbf7f0; Fraunces headings, Inter body; an original seigaiha wave pattern as an SVG data URI. Components: owner bar, sticky header with Tools dropdown and mobile drawer, festival ribbon, hero, countdown strip, cards, tiles, chips, tags (lucky/caution/avoid), multi-step forms, lead CTA block, floating lead bar, FAQ accordions, video facade, newsletter band, footer. WCAG AA contrast, visible focus, reduced-motion support, print styles.

Checks: no horizontal scroll at 360px; header fits at 390px; `[hidden]` always hides.

## Phase 3: Build system

> Use GitHub Pages' built-in Jekyll. Write `_layouts/default.html` with the owner bar, header and Tools dropdown, AdSense script (skippable with `ads: false`), canonical, Open Graph, JSON-LD (Organization, WebSite + SearchAction, BreadcrumbList, Article) and a relative `<base href>` computed from `page.url`, so the site works at github.io/orientalgiftshop-com/ and at the custom domain. Write `_layouts/guide.html` (header, share buttons, sticky table of contents, related guides from `_data/guides.yml`). Add `assets/js/enhance.js` to build the table of contents, insert the concierge CTA after the second section and an ad slot after the fourth, and emit FAQPage JSON-LD from `<details class="faq">`. Keep sitemap.xml and search.json at the root.

Checks: every page renders with zero console errors; every internal link resolves.

## Phase 4: Data

> Create JSON datasets in `assets/data/`: `gifts.json` (60+ ideas tagged by culture, occasion, recipient, budget band 1–4, style, with "why" and "tip"), `symbols.json` (45+ colours, numbers, flowers, animals, foods, objects with per-culture verdict lucky/ok/caution/avoid and notes), `festivals.json` (17 festivals with dates through 2029, regions, what to give, what to avoid, guide link), `occasions.json`, `news.json`.

Checks: every gift idea avoids the taboos listed for its own cultures.

## Phase 5: Interactive tools

> In `assets/js/tools.js` build: Gift Finder (5-step quiz, scored matches, avoid list, shareable result URL, save to list), Gift Ideas (search + filters + saved list + copy list), Taboo Checker (keyword match against symbols, per-culture verdicts), Symbolism Dictionary, Lucky Amount Calculator (Chinese even/no-4/8s, Vietnamese, Korean odd units, Japanese odd leading digit/no 4 or 9, Indian amounts ending in 1, plus funeral rules), Zodiac Matcher (exact Lunar New Year boundaries 1930–2035, element by year), Festival Calendar (countdowns, region filter, .ics download with 14-day alarm), Greetings Phrasebook (copy buttons).

Checks: zero console errors; each tool works on mobile.

## Phase 6: Content

> Write 12 original guides (600–1,100 words): Lunar New Year 2027 (Year of the Goat), Japanese etiquette, Chinese taboos, Korean gifts, Diwali, red envelopes and cash gifts, weddings across Asia, corporate gifting in Asia, tea gifts, Mid-Autumn and mooncakes, furoshiki, housewarming gifts. Each: tables, practical lists, a "what to avoid" section, internal links to tools, and a concierge mention. Add explanatory text and FAQs on every tool page.

Checks: no copied text; facts that vary by region are flagged as such.

## Phase 7: Lead generation (Gift Concierge)

> Build `/concierge.html`: hero promise ("curated in 48 hours"), 4-step form (need → occasion/quantity/budget/deadline → cultures/extras/notes → contact + consent), automatic lead scoring (need type, quantity, budget, extras, phone, company), UTM and landing-page attribution, subject line containing occasion and score, how-it-works, use cases, FAQ. Feed it from in-guide CTAs, tool results, the floating "Need 10+ gifts?" bar, the home page band and the footer. Add `/for-sellers.html` (supplier applications) so leads can be fulfilled.

Checks: end-to-end submission reaches the inbox and lands on `thank-you.html?f=concierge`.

## Phase 8: Community and revenue pages

> Build Support (one-time/monthly amounts without 4s, pledge form, payment links from config, "where your support goes": research, operations, promotion, hiring talent, contests and prizes), Contests (seasonal contest with prize from config, entry form, rules summary), Careers (writers, cultural reviewers, translators, illustrators, video creators, partnerships), Advertise (rate card, media kit form), Video Hall (furoshiki embeds via privacy-enhanced facade, topic links, video suggestion form), News (auto-refreshed headlines).

## Phase 9: AdSense compliance and legal

> Add ads.txt, privacy policy with Google advertising-cookie disclosure and opt-out links, terms, disclaimer with affiliate disclosure, editorial policy, trademark and copyright disclosure with takedown process, cookie notice, noindex and no ads on thank-you/404/search, robots.txt and sitemap.

## Phase 10: Automation and deployment

> Add `automation/fetch_news.py` (Google News RSS, standard library) and `automation/update-news.yml` (daily: fetch news into `assets/data/news.json` and commit; Pages republishes). Push to `WEBWORKSA1/orientalgiftshop-com` on `main`; enable GitHub Pages from `main` / root; attach `orientalgiftshop.com`; add the workflow file under `.github/workflows/`.

## Phase 11: Growth (after launch)

> Submit sitemap in Google Search Console. Publish one new guide per festival 6–8 weeks before the date (Year of the Goat, Seollal, Tết, Holi, Eid, Ochūgen, Chuseok, Diwali, Oseibo). Add Filipino, Indonesian, Malaysian and Sri Lankan customs. Translate top guides into Simplified Chinese, Japanese, Korean and Hindi. Recruit 20 suppliers before running paid traffic to the concierge. After AdSense approval, paste display slot IDs into `config.js`.
