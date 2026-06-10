import { getAllRestaurants } from "@/lib/data";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://menugo.vercel.app";

  // Fetch all live restaurants
  const restaurants = await getAllRestaurants();

  // Create sitemap entries for dynamic restaurant pages
  const restaurantUrls = restaurants.map((restaurant) => ({
    url: `${baseUrl}/${restaurant.slug}`,
    lastModified: new Date(restaurant.updatedAt || new Date()),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Create standard static pages
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];

  return [...staticUrls, ...restaurantUrls];
}
