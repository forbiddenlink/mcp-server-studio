/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mcp-server-studio.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Next metadata image files are assets, not pages.
  exclude: ['/icon.png', '/opengraph-image.png'],
}
