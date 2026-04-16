/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://mcp-server-studio.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
}
