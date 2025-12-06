/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure proper static generation
  output: 'standalone',
}

module.exports = nextConfig
