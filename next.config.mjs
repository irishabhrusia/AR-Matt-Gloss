const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'horizons-cdn.hostinger.com',
      },
      {
        protocol: 'https',
      hostname: 'images.pexels.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/services.html',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/portfolio.html',
        destination: '/portfolio',
        permanent: true,
      },
      {
        source: '/testimonials.html',
        destination: '/testimonials',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/services/:slug.html',
        destination: '/services/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
