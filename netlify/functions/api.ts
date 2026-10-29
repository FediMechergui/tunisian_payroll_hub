// ============================================================================
// PayrollHub — Netlify Function Entry Point
// Serves the same Express API as api/index.mjs does on Vercel
// ============================================================================

import serverless from "serverless-http";
import app from "../../server/vercel-entry";

// Set at runtime only, so the build still installs devDependencies
process.env.NODE_ENV ??= "production";

export const handler = serverless(app, {
  // Rewrites can hand over the function path; Express routes live under /api
  request(req: { url: string }) {
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "/api");
  },
});
