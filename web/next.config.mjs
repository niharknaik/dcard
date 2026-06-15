/** @type {import('next').NextConfig} */

// Allow the app to call its backend API. If NEXT_PUBLIC_API_URL is set we
// whitelist that exact origin in connect-src; otherwise we fall back to the
// broad `https:` source. NOTE: tighten by always setting NEXT_PUBLIC_API_URL
// in the deploy environment so connect-src is pinned to the real API origin.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || 'https:';

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()'},
          {key: 'X-DNS-Prefetch-Control', value: 'on'},
          {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
          {key: 'Content-Security-Policy', value: contentSecurityPolicy},
        ],
      },
    ];
  },
};

export default nextConfig;
