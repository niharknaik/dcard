/** @type {import('next').NextConfig} */

// Allow the app to call its backend API. We whitelist the API's ORIGIN in
// connect-src. IMPORTANT: NEXT_PUBLIC_API_URL includes a path (…/api/v1), but a
// CSP source carrying a path only matches that exact URL — which would block
// sub-paths like /api/v1/auth/login. So we strip it down to scheme://host.
// Falls back to the broad `https:` source if the URL is unset/unparseable.
function apiOriginFrom(value) {
  if (!value) return 'https:';
  try {
    return new URL(value).origin;
  } catch {
    return 'https:';
  }
}
const apiOrigin = apiOriginFrom(process.env.NEXT_PUBLIC_API_URL);

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
