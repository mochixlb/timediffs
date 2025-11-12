/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers are now handled by proxy.ts
  // This allows us to use CSP nonces instead of 'unsafe-inline' for better security
  // See proxy.ts for CSP configuration
};

module.exports = nextConfig;
