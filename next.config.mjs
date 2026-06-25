/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Brand-analysis scraping (Playwright/Puppeteer) and the Anthropic SDK run
  // only on the server; keep them out of the client bundle.
  serverExternalPackages: ["@anthropic-ai/sdk"],
};

export default nextConfig;
