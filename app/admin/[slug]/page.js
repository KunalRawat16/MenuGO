import { getRestaurantBySlug } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import { cookies } from "next/headers";

export default async function AdminRestaurantPage({ params }) {
  const { slug } = await params;
  
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("admin_session")?.value;

  if (!sessionData) {
    redirect("/login");
  }

  const session = JSON.parse(sessionData);
  
  // Allow if superadmin OR if the slug matches the session slug
  if (session.role !== "superadmin" && session.slug !== slug) {
    redirect("/login");
  }
  
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <AdminClient restaurant={restaurant} />
    </main>
  );
}
