const isProd = process.env.NODE_ENV === "production";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // // Ensure Next.js uses SSG instead of SSR
  // output: "export",
  // Note: This feature is required to use the Next.js Image component in SSG mode.
  images: {
    unoptimized: true,
  },

  // Add trailingSlash for better static file serving
  trailingSlash: true,
};

export default nextConfig;
