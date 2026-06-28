/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Mongoose/bcryptjs pull optional native deps; keep them external so route
    // handlers (Node runtime) bundle cleanly. (Next 15 renames this to top-level
    // `serverExternalPackages`.)
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs'],
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
