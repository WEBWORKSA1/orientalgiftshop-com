# OrientalGiftShop.com

The independent guide to meaningful gifts across Asian cultures: free Gift Finder, Taboo Checker, Lucky Amount Calculator, Zodiac Matcher, Symbolism Dictionary, Greetings Phrasebook, a self-updating festival calendar, 12 in-depth guides, and a free **Gift Concierge** that turns corporate, bulk and wedding gifting traffic into leads.

Static Jekyll site. Hosted free on GitHub Pages from `main` (root).

- `RESEARCH.md`: the concept, revenue model, risks and the 38-site benchmark review
- `PROMPTS.md`: phase-by-phase prompts to rebuild or extend the site

## How it is built

GitHub Pages builds the site with Jekyll on every push: one shared layout (owner bar, header, AdSense, structured data) wraps every page, so pages contain only their own content.

| Path | What it holds |
| --- | --- |
| `*.html` (root) | Pages: tools, concierge, support, contests, careers, legal. Front matter sets title, description and `tools: true` for interactive pages |
| `guides/*.md` | Guides in Markdown. Copy a file to add one, then add a row to `_data/guides.yml` so it appears in cards and "Keep reading" |
| `_layouts/` | `default.html` (whole-site shell) and `guide.html` (article template) |
| `_data/guides.yml` | Guide list that drives the home page, guides index and related links |
| `assets/data/*.json` | Gift ideas, symbols and taboos, festival dates, news headlines |
| `assets/js/config.js` | Encoded form inbox, AdSense slot IDs, payment links, affiliate tags, contest prize |
| `assets/js/site.js`, `tools.js`, `enhance.js`, `footer.js` | Forms and lead scoring, interactive tools, guide table of contents and FAQ data, shared footer |
| `automation/` | Daily news refresh (GitHub Actions) |
| `sitemap.xml`, `search.json` | Sitemap and site-search index. Add new pages here too |

Every page writes a relative `<base href>`, so the same files work at `https://webworksa1.github.io/orientalgiftshop-com/` and at `https://orientalgiftshop.com/`.

## Self-updating parts

- **In the browser, every visit:** next-festival ribbon and countdown, festival calendar (always the next 12 months), gift idea of the day, the coming Lunar New Year animal, copyright year.
- **Daily via GitHub Actions (after step 5 below):** fresh gifting and festival headlines on `news.html`.
- **On every push:** Jekyll rebuilds all pages, cache-busting asset versions and "last updated" stamps.
- **Yearly (5 minutes):** append the next year's dates to `assets/data/festivals.json`.

## One-time setup checklist

1. **Publish from main.** Settings → Pages → Build and deployment → *Deploy from a branch* → `main` / `(root)` → Save. (If a `gh-pages` branch exists, it was only used to switch Pages on and can be deleted once `main` is selected.)
2. **Custom domain** (required for AdSense approval): Settings → Pages → Custom domain `orientalgiftshop.com` → Save. At the registrar set A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and a `www` CNAME to `webworksa1.github.io`. Tick *Enforce HTTPS* once the certificate is issued.
3. **Forms:** submit any form once. FormSubmit sends a one-time activation email to the site inbox; click *Activate*. All forms then deliver. The address is stored encoded in `assets/js/config.js` and never appears in the page source.
4. **AdSense:** add `orientalgiftshop.com` in AdSense, keep `ads.txt` at the root, turn on Auto ads, and enable Google's consent message for EEA/UK/Switzerland. After approval, paste display slot IDs into `adSlots` in `assets/js/config.js`.
5. **Automation:** Add file → Create new file → `.github/workflows/update-news.yml`, paste the contents of `automation/update-news.yml`, commit. Then Actions → *Update gifting news* → Run workflow. (The connector that built the site is not allowed to create workflow files.)
6. **Payments:** paste PayPal / Stripe / Buy Me a Coffee links into `donate` in `config.js`. Until then the Support page collects pledges.
7. **Affiliates (optional):** add Amazon/Etsy affiliate URL patterns to `affiliates` in `config.js`.

## Trademark & copyright

Original content © OrientalGiftShop.com. Third-party names are trademarks of their owners and used for identification only. Embedded videos remain the property of their creators and play from YouTube. Full disclosure: `legal.html`.

Website, domain, sponsorship, advertising and partnership enquiries: https://web.works/contact
