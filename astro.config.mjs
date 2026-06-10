import { defineConfig } from "astro/config";
import fs from "node:fs";

const SITE = "https://aesopanalytics.com";

// Inline sitemap generator. We don't use @astrojs/sitemap because its
// build:done hook (v3.7.3) is incompatible with Astro 4.16.x and crashes
// ("Cannot read properties of undefined (reading 'reduce')"). This reads the
// stable `pages` list Astro hands to build:done and writes a standard
// sitemap.xml into the output directory. Covers every indexable page; excludes
// 404 and any noindex utility pages.
function sitemap() {
  return {
    name: "aesop-sitemap",
    hooks: {
      "astro:build:done": ({ pages, dir }) => {
        const lastmod = new Date().toISOString().slice(0, 10);
        // Keep the sitemap in sync with noindex pages — never list a URL we
        // tell crawlers not to index.
        const NOINDEX = ["404", "thanks"];
        const urls = [
          ...new Set(
            pages
              .map((p) => p.pathname)
              .filter((path) => !NOINDEX.some((n) => path.startsWith(n)))
              .map((path) => new URL(path, SITE + "/").href)
          ),
        ].sort();
        const body = urls
          .map((u) => `  <url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`)
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
        fs.writeFileSync(new URL("sitemap.xml", dir), xml);
        console.log(`[aesop-sitemap] wrote sitemap.xml with ${urls.length} URLs`);
      },
    },
  };
}

// Phase 0: a fully static site (output: 'static' is the default).
// Phase 4 switches this to a hybrid/server output with a deploy adapter
// (Cloudflare Pages is the lean) so /api/lead can run server-side and
// keep the CRM key off the client.
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
});
