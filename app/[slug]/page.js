import { getRestaurantBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import MenuClient from "./MenuClient";

export default async function RestaurantMenuPage({ params }) {
  const { slug } = await params;
  
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <MenuClient restaurant={restaurant} />
    </main>
  );
}
