// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.230.*.*",
    "192.168.*.*",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8081",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;