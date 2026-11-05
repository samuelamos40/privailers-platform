import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://privailers.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/about', '/services', '/courses', '/contact', '/register', '/login', '/privacy', '/terms', '/refund-policy'],
                disallow: ['/admin', '/admin-login', '/admin-register', '/instructor', '/student', '/classroom', '/checkout', '/api'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
