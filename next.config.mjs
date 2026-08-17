/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https: wss: ws:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
      // Firebase's sign-in helper is embedded by the Auth SDK. It must be allowed
      // to load inside our own domain instead of inheriting the app's DENY policy.
      {
        source: "/__/auth/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "default-src 'self' https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https:" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/__/auth/:path*", destination: "https://jagruk-bharat-37311.firebaseapp.com/__/auth/:path*" },
      { source: "/__/firebase/:path*", destination: "https://jagruk-bharat-37311.firebaseapp.com/__/firebase/:path*" },
    ];
  },
}

export default nextConfig
