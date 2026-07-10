/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  allowedDevOrigins: ['192.168.2.2', '10.230.0.231', 'localhost'],
};

export default nextConfig;
