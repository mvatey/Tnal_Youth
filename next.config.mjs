// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.2.2', '10.230.0.231','10.230.0.63', 'localhost'],
};

export default nextConfig;
