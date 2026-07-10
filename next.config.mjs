<<<<<<< HEAD
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
=======
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['192.168.2.2', '10.230.0.231', 'localhost'],
>>>>>>> origin/feature/donation
};

export default nextConfig;