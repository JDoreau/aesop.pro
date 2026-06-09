# Aesop Analytics → Astro: cutover

This bundle is the complete, build-verified Astro site: 8 core pages, 17 articles/
field studies, a data-driven Insights hub, and 5 static tool/reference pages. It
builds clean to **25 pages**, and `public/` already contains everything Pages serves
(assets, favicon, CNAME, robots.txt, a regenerated sitemap.xml, shared.css, core.css,
and the 5 static pages). Nothing here touches the live site until step 6.

## What stays, what goes
- **KEEP at repo root** (not web content, left untouched): `assessment-kit/`,
  `Aesop_Analytics_KPI_Dictionary_Template.xlsx`,
  `Aesop_Analytics_Reporting_Inventory_Template.xlsx`, `README.md`, `.git`.
- **DELETE** (obsolete — replaced by `src/pages` + `public/`): the old page HTML,
  the old root CSS, and the root copies of the served files (now in `public/`).
- **ADD** (from this bundle): `src/`, `public/`, `astro.config.mjs`, `package.json`,
  `package-lock.json`, `.github/`, `.gitignore`.

Note: `assets/` also holds `stamp_owl.py` (a dev script). It is not part of the site;
if you want to keep it, move it out before step 2.

---

## 1. New branch (live site untouched)
From your clone `C:\Users\dorea\OneDrive\Desktop\CODE\aesop.pro\WEBSITE`:

    git checkout -b astro-migration

## 2. Remove the obsolete files
(`--ignore-unmatch` means any already-untracked file is skipped silently — no errors.)

    git rm --ignore-unmatch index.html services.html work.html assessment.html insights.html resources.html about.html contact.html
    git rm --ignore-unmatch "article-*.html" aesop-productivity-pay-study.html
    git rm --ignore-unmatch health-check.html sample-assessment.html trust-letter.html dashboard-audit.html brand.html
    git rm --ignore-unmatch article.css core.css shared.css
    git rm --ignore-unmatch CNAME robots.txt sitemap.xml favicon.svg owl-mark.svg owl-mark-reversed.svg
    git rm -r --ignore-unmatch assets "NVIDIA Corporation"
    git rm --ignore-unmatch "*.local.bak"

## 3. Drop in the bundle
Extract the contents of `aesop-astro-migration.zip` directly into the repo root so
`src/`, `public/`, `.github/`, `astro.config.mjs`, `package.json`, etc. sit at the top
level (not inside a nested folder). It will merge cleanly with the files you kept.

## 4. Verify locally  ← pause here and tell me the output
    npm install
    npm run build

Expected: `25 page(s) built`. (Then I'll verify the working tree before you commit.)

## 5. Commit + push the branch
    git add -A
    git commit -m "Migrate site to Astro: shared layouts, data-driven Insights hub, clean routes"
    git push -u origin astro-migration

Your work is now in git on GitHub. Live site still untouched.

---

## 6. GO LIVE (only step that changes production — when you're ready)
1. Merge: `git checkout main && git merge astro-migration && git push`
2. GitHub → repo **Settings → Pages → Build and deployment → Source → "GitHub Actions"**

The deploy workflow runs on that push and publishes the built site. `public/CNAME`
preserves the domain; SSL re-provisions automatically.
