import { getRestaurantBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return {
      title: "Menu Not Found | MenuGO",
      description: "The digital menu you are looking for does not exist or has been removed."
    };
  }

  return {
    title: `${restaurant.name} - Digital Menu | MenuGO`,
    description: `Order delicious food from ${restaurant.name} directly from your phone. View live menu, prices, and track orders in real time.`,
    openGraph: {
      title: `${restaurant.name} | MenuGO Digital Menu`,
      description: `Check out the latest dishes, prices, and customized ordering at ${restaurant.name}.`,
      images: restaurant.logo ? [{ url: restaurant.logo }] : [],
    }
  };
}

export default async function RestaurantMenuPage({ params }) {
  const { slug } = await params;
  
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" suppressHydrationWarning>
      <MenuClient restaurant={restaurant} />
    </main>
  );
}
