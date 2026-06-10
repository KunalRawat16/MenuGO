export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://menugo.vercel.app";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Hide sensitive dashboard and API routes from Google
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
