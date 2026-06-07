import { getRestaurantBySlug } from "@/lib/data";
import LandingPage from "@/components/LandingPage";

export const metadata = {
  title: "MenuGO | Experience Next-Gen Digital Dining",
  description: "Frictionless digital menus for restaurants. QR code scanning, self-ordering, and real-time administrative dashboards.",
};

export default async function Page() {
  // Try to load 'yellow-chilli-meerut' as mock preview client data
  const restaurant = await getRestaurantBySlug("yellow-chilli-meerut");

  return <LandingPage restaurant={restaurant} />;
}
