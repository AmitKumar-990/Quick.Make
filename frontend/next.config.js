/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance & SEO
    compress: true,
    poweredByHeader: false,
    generateEtags: true,

    // Image optimization
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'via.placeholder.com' },
            { protocol: 'http', hostname: 'https://quick-make-backend.onrender.com' }
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Headers for SEO and security
    async headers() {
        return [{
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [{ key: 'Cache-Control', value: 'no-store' }],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [{
            source: '/recipe/:slug',
            destination: '/recipes/:slug',
            permanent: true,
        }, ];
    },

    // Experimental features
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
};

module.exports = nextConfig;