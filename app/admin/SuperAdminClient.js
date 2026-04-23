"use client";

import { useState } from "react";
import { Plus, X, Building2, Store, ArrowRight, Eye, Settings, LayoutDashboard, Users, LogOut, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadImageAction, createRestaurantAction, logoutAction, updateSubscriptionPlanAction, deleteRestaurantAction } from "@/app/actions";

export default function SuperAdminClient({ initialRestaurants }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useState(() => {
    // Only set mounted on the client
    if (typeof window !== "undefined") setMounted(true);
  });

  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    adminPassword: "",
    logoUrl: "",
    bannerUrl: ""
  });
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", address: "", adminPassword: "", logoUrl: "", bannerUrl: "" });
    setLogoFile(null);
    setBannerFile(null);
  };

  const handleUpdatePlan = async (slug, newPlan, cycle = 'none', customDate = null) => {
    const confirmMsg = cycle !== 'none' 
      ? `Change plan to ${newPlan.toUpperCase()} (${cycle})?`
      : `Change plan to ${newPlan.toUpperCase()}?`;
      
    if (!customDate && !confirm(confirmMsg)) return;
    
    const res = await updateSubscriptionPlanAction(slug, newPlan, cycle, customDate);
    if (res.success) {
      setRestaurants(restaurants.map(r => 
        r.slug === slug ? { 
          ...r, 
          subscription: { 
            ...r.subscription, 
            plan: newPlan, 
            billingCycle: cycle,
            validUntil: customDate || (newPlan === 'free' ? null : new Date(Date.now() + (cycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString())
          } 
        } : r
      ));
    } else {
      alert("Error updating plan");
    }
  };
  
  const handleDeleteRestaurant = async (slug, name) => {
    if (!confirm(`CRITICAL: Are you sure you want to DELETE "${name}"? This action is permanent and cannot be undone.`)) return;
    
    setIsLoading(true);
    const res = await deleteRestaurantAction(slug);
    if (res.success) {
      setRestaurants(restaurants.filter(r => r.slug !== slug));
    } else {
      alert(res.error || "Failed to delete restaurant");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let logo = formData.logoUrl;
    if (logoFile) {
      const form = new FormData();
      form.append("file", logoFile);
      const res = await uploadImageAction(form);
      if (res.success) logo = res.url;
    }

    let banner = formData.bannerUrl;
    if (bannerFile) {
      const form = new FormData();
      form.append("file", bannerFile);
      const res = await uploadImageAction(form);
      if (res.success) banner = res.url;
    }

    const res = await createRestaurantAction({
      name: formData.name,
      address: formData.address,
      adminPassword: formData.adminPassword,
      logo: logo,
      banner: banner
    });

    if (res.success) {
      // Redirect to the new restaurant's admin panel
      router.push(`/admin/${res.slug}`);
    } else {
      alert(res.error || "Failed to create restaurant");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex font-sans selection:bg-orange-500/30" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 hidden md:flex flex-col sticky top-0 h-screen" suppressHydrationWarning>
        <div className="p-6 border-b border-white/10" suppressHydrationWarning>
          <div className="flex items-center gap-3" suppressHydrationWarning>
            <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg text-white shadow-lg shadow-orange-500/20" suppressHydrationWarning>
              <Building2 size={20} />
            </div>
            <h2 className="font-bold text-lg tracking-tight text-white">SuperAdmin</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl font-medium transition-colors">
            <LayoutDashboard size={18} className="text-orange-400" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Users size={18} />
            Restaurants
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Settings size={18} />
            Settings
          </a>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" suppressHydrationWarning>
        <div className="max-w-6xl mx-auto p-4 sm:p-8" suppressHydrationWarning>
          {/* Mobile Header */}
          <div className="md:hidden flex justify-between items-center mb-6" suppressHydrationWarning>
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <div className="p-1.5 bg-orange-500 rounded text-white" suppressHydrationWarning>
                <Building2 size={16} />
              </div>
              <h2 className="font-bold text-lg text-white">SuperAdmin</h2>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Overview</h1>
              <p className="text-sm text-gray-400 mt-1">Manage all registered restaurants and subscriptions</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-400 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Plus size={18} /> New Restaurant
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-gray-400 text-sm font-medium mb-1">Total Restaurants</div>
              <div className="text-3xl font-bold text-white">{restaurants.length}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-gray-400 text-sm font-medium mb-1">Active Subscriptions</div>
              <div className="text-3xl font-bold text-white">{restaurants.filter(r => r.subscription?.plan === 'paid').length}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-gray-400 text-sm font-medium mb-1">Total Menu Items</div>
              <div className="text-3xl font-bold text-white">{restaurants.reduce((acc, r) => acc + (r.itemCount || 0), 0)}</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">Restaurants List</h2>

          {/* Restaurants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => (
              <div key={r.id} className="bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300 backdrop-blur-md flex flex-col">
                <div className="relative h-32 bg-gray-900 border-b border-white/10">
                  {r.banner && (
                    <Image src={r.banner} alt={r.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                </div>
                <div className="p-5 relative flex-1 flex flex-col">
                  <div className="absolute -top-10 left-5">
                    <div className="relative w-16 h-16 rounded-2xl border-2 border-gray-800 overflow-hidden bg-gray-900 shadow-xl">
                      <Image src={r.logo} alt={r.name} fill sizes="64px" className="object-cover" />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex-1">
                    <h3 className="font-bold text-xl text-white leading-tight">{r.name}</h3>
                    <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium">
                      <Store size={14} className="text-orange-500" /> {r.address || "No address provided"}
                    </p>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">
                        {r.itemCount} items
                      </div>
                      <div className={`inline-block px-3 py-1 border rounded-full text-xs font-bold uppercase
                        ${r.subscription?.plan === 'paid' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 
                          r.subscription?.plan === 'trial' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 
                          'bg-white/5 border-white/10 text-gray-400'}`}
                      >
                        {r.subscription?.plan || 'FREE'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan Management */}
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Plan Type:</span>
                      <select 
                        value={r.subscription?.plan || 'free'}
                        onChange={(e) => handleUpdatePlan(r.slug, e.target.value, r.subscription?.billingCycle || 'none')}
                        className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 text-gray-200 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="free" className="bg-gray-900 text-white">Free</option>
                        <option value="trial" className="bg-gray-900 text-white">Trial</option>
                        <option value="paid" className="bg-gray-900 text-white">Paid</option>
                      </select>
                    </div>

                    {r.subscription?.plan === 'paid' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Billing:</span>
                        <select 
                          value={r.subscription?.billingCycle || 'yearly'}
                          onChange={(e) => handleUpdatePlan(r.slug, 'paid', e.target.value)}
                          className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 text-gray-200 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="monthly" className="bg-gray-900 text-white">Monthly</option>
                          <option value="yearly" className="bg-gray-900 text-white">Yearly</option>
                        </select>
                      </div>
                    )}

                    {r.subscription?.plan !== 'free' && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Valid Until:</span>
                        <input 
                          type="date"
                          value={r.subscription?.validUntil ? new Date(r.subscription.validUntil).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleUpdatePlan(r.slug, r.subscription?.plan || 'trial', r.subscription?.billingCycle || 'none', e.target.value)}
                          className="text-[10px] border border-white/10 rounded-lg px-2 py-1 bg-white/5 text-gray-400 outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link href={`/${r.slug}`} target="_blank" className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-colors border border-white/10">
                      Preview
                    </Link>
                    <button 
                      onClick={() => handleDeleteRestaurant(r.slug, r.name)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 group-hover:border-red-500/50"
                      title="Delete Restaurant"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link href={`/admin/${r.slug}`} className="flex-[2] text-center py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-orange-500/20">
                      Manage <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {restaurants.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed backdrop-blur-sm mt-8">
              <Store size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white">No restaurants found</h3>
              <p className="text-gray-400 mt-2 max-w-sm mx-auto">Get started by registering the first restaurant on your platform.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-8 inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
              >
                <Plus size={18} /> Register Now
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" suppressHydrationWarning>
          <div className="bg-[#111] rounded-3xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up" suppressHydrationWarning>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="font-bold text-xl text-white">Register New Restaurant</h2>
                <p className="text-xs text-gray-400 mt-1">A custom URL slug will be auto-generated.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Restaurant Name <span className="text-orange-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-inner"
                  placeholder="e.g. The Spicy Kitchen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Address <span className="text-orange-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-inner"
                  placeholder="e.g. 123 Main St, City"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Admin Password <span className="text-orange-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.adminPassword} 
                  onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-inner"
                  placeholder="Password for the restaurant owner"
                />
              </div>
              
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-gray-200 mb-3">Branding (Optional)</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Logo Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if(e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Banner Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if(e.target.files && e.target.files[0]) {
                        setBannerFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-400 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/20">
                  {isLoading ? "Registering..." : (
                    <>
                      Register <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
