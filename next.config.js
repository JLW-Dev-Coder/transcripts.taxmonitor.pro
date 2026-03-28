/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/sign-in.html',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/legal/privacy.html',
        destination: '/legal/privacy',
        permanent: true,
      },
      {
        source: '/legal/refund.html',
        destination: '/legal/refund',
        permanent: true,
      },
      {
        source: '/legal/terms.html',
        destination: '/legal/terms',
        permanent: true,
      },
      {
        source: '/magnets/lead-magnet.html',
        destination: '/magnets/lead-magnet',
        permanent: true,
      },
      {
        source: '/magnets/section-7216-dislcosure.html',
        destination: '/magnets/section-7216',
        permanent: true,
      },
      {
        source: '/resources/index.html',
        destination: '/resources',
        permanent: true,
      },
      {
        source: '/resources/',
        destination: '/resources',
        permanent: true,
      },
    ]
  },
}
module.exports = nextConfig
