const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.gstatic.com; connect-src 'self' https: wss: ws:; frame-src 'self' https://jagruk-bharat-37311.firebaseapp.com https://jagruk-bharat-37311.web.app https://accounts.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;

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
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
}

export default nextConfig
