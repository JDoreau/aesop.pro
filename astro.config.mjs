import { defineConfig } from "astro/config";

// Phase 0: a fully static site (output: 'static' is the default).
// Phase 4 switches this to a hybrid/server output with a deploy adapter
// (Cloudflare Pages is the lean) so /api/lead can run server-side and
// keep the CRM key off the client.
export default defineConfig({
  site: "https://aesopanalytics.com",
});
