import { getAllRestaurants } from "@/lib/data";
import SuperAdminClient from "./SuperAdminClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("admin_session")?.value;

  if (!sessionData) {
    redirect("/login");
  }

  const session = JSON.parse(sessionData);
  if (session.role !== "superadmin") {
    redirect("/login");
  }

  const allRestaurants = await getAllRestaurants();
  
  const restaurants = allRestaurants.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    logo: r.logo,
    banner: r.banner,
    address: r.address,
    itemCount: r.menuItems ? r.menuItems.length : 0,
    subscription: r.subscription || { plan: 'free' }
  }));

  return <SuperAdminClient initialRestaurants={restaurants} />;
}
