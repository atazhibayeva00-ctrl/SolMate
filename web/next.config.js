/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  onDemandEntries: {
    // Prevent dev server from purging the cache every few seconds
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 10,
  },
  devIndicators: {
    buildActivity: false,
  },
};

module.exports = nextConfig;
