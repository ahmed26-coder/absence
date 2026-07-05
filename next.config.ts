import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gubdobtkoizgxjpwkbaw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google account avatars from OAuth sign-in
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
