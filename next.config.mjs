// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.230.*.*",
    "192.168.*.*",
  "10.240.*.*",
  ],
};

export default nextConfig;