/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/magnets/section-7216-disclosure',
        destination: '/magnets/section-7216/',
        permanent: true,
      },
      {
        source: '/magnets/section-7216-dislcosure',
        destination: '/magnets/section-7216/',
        permanent: true,
      },
    ];
  },
}
module.exports = nextConfig
