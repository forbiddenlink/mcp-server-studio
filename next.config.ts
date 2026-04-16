import type { NextConfig } from "next";
import { withAxiom } from 'next-axiom';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzerInit from "@next/bundle-analyzer";
const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === "true" });


const nextConfig: NextConfig = {
  /* config options here */
};

export default withBundleAnalyzer(withSentryConfig(withAxiom(nextConfig), {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }));
