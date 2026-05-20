import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Phase 2 Step 12 — next-intl plugin wires src/i18n/request.ts into Next so
// the App Router can resolve the message catalog per [locale] segment on the
// server. The plugin path argument MUST match the request-config location.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
