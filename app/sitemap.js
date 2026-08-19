import dbConnect from "@/lib/db";
import Business from "@/models/Business";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://menugo.in";

  let businessUrls: any[] = [];
  try {
    await dbConnect();
    const businesses = await Business.find({ isActive: true, isSuspended: false }).select("slug updatedAt").lean();
    businessUrls = businesses.map((b: any) => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Sitemap fetch error:", err);
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...businessUrls];
}
