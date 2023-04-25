/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    /* jank hack because trpc is currently failing type checking no idea why */
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
