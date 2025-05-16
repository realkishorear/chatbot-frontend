/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEW: Allow cross-origin iframe usage for development
  allowedDevOrigins: ['http://192.168.159.96:3000'], // Replace with your actual IP and port

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // or 'SAMEORIGIN' depending on your deployment
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;
