"use client";

import { useState, useEffect } from "react";
import { Plus, X, Building2, Store, ArrowRight, Eye, Settings, LayoutDashboard, Users, LogOut, Trash2, Key } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadImageAction, createRestaurantAction, logoutAction, updateSubscriptionPlanAction, deleteRestaurantAction, getPlatformSettingsAction, updatePlatformSettingsAction, updateRestaurantCredentialsAction } from "@/app/actions";

export default function SuperAdminClient({ initialRestaurants }) {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, restaurants, settings
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedCredentialsSlug, setSelectedCredentialsSlug] = useState(null);
  const [credentialsData, setCredentialsData] = useState({ username: "", password: "" });
  const [isSavingCredentials, setIsSavingCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    superadminUsername: "superadmin",
    superadminPassword: "password",
    trialDurationDays: 30,
    freePlanItemLimit: 10
  });

  // Fetch Platform Settings on mount
  useEffect(() => {
    getPlatformSettingsAction().then(res => {
      if (res.success && res.settings) {
        setPlatformSettings(res.settings);
      }
    });
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const res = await updatePlatformSettingsAction(platformSettings);
    if (res.success) {
      alert("Platform configuration saved successfully!");
    } else {
      alert("Error saving settings: " + res.error);
    }
    setIsSavingSettings(false);
  };

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

  const handleOpenCredentialsModal = (restaurant) => {
    setSelectedCredentialsSlug(restaurant.slug);
    setCredentialsData({
      username: restaurant.username || restaurant.slug,
      password: restaurant.adminPassword || ""
    });
    setIsCredentialsModalOpen(true);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setIsSavingCredentials(true);
    const res = await updateRestaurantCredentialsAction(selectedCredentialsSlug, credentialsData.username, credentialsData.password);
    if (res.success) {
      alert("Credentials updated successfully!");
      setIsCredentialsModalOpen(false);
      setRestaurants(restaurants.map(r => 
        r.slug === selectedCredentialsSlug ? { ...r, username: credentialsData.username, adminPassword: credentialsData.password } : r
      ));
    } else {
      alert("Error: " + res.error);
    }
    setIsSavingCredentials(false);
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex font-sans selection:bg-green-500/30" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 hidden md:flex flex-col sticky top-0 h-screen" suppressHydrationWarning>
        <div className="p-6 border-b border-white/10" suppressHydrationWarning>
          <div className="flex items-center gap-3" suppressHydrationWarning>
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg text-white shadow-lg shadow-green-500/20" suppressHydrationWarning>
              <Building2 size={20} />
            </div>
            <h2 className="font-bold text-lg tracking-tight text-white">SuperAdmin</h2>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-green-400' : ''} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("restaurants")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'restaurants' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={18} className={activeTab === 'restaurants' ? 'text-green-400' : ''} />
            Restaurants
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={18} className={activeTab === 'settings' ? 'text-green-400' : ''} />
            Settings
          </button>
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
              <div className="p-1.5 bg-green-500 rounded text-white" suppressHydrationWarning>
                <Building2 size={16} />
              </div>
              <h2 className="font-bold text-lg text-white">SuperAdmin</h2>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-white/5" suppressHydrationWarning>
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <LayoutDashboard size={14} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("restaurants")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors whitespace-nowrap ${activeTab === 'restaurants' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <Users size={14} />
              Restaurants
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              <Settings size={14} />
              Settings
            </button>
          </div>

          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {activeTab === 'dashboard' ? 'Platform Overview' : activeTab === 'restaurants' ? 'Restaurants Management' : 'Platform Settings'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === 'dashboard' ? 'Manage all registered restaurants and subscriptions' : activeTab === 'restaurants' ? 'Detailed list of all platform partners' : 'Global platform configuration'}
              </p>
            </div>
            {activeTab !== 'settings' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-400 transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20"
              >
                <Plus size={18} /> New Restaurant
              </button>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <>
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

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Recently Added</h2>
                <button onClick={() => setActiveTab('restaurants')} className="text-sm font-semibold text-green-500 hover:text-green-400 flex items-center gap-1">
                  View All <ArrowRight size={14} />
                </button>
              </div>

              {/* Restaurants Grid (Recent Only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.slice(0, 3).map(r => (
                  <div key={r.id} className="bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300 backdrop-blur-md flex flex-col">
                    <div className="p-5 relative flex-1 flex flex-col mt-2">
                      <div className="mt-8 flex-1">
                        <h3 className="font-bold text-xl text-white leading-tight">{r.name}</h3>
                        <p className="text-sm text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium">
                          <Store size={14} className="text-green-500" /> {r.address || "No address provided"}
                        </p>
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gray-300">
                            {r.itemCount || 0} items
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
                            className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-white/5 text-gray-200 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                          >
                            <option value="free" className="bg-gray-900 text-white">Free</option>
                            <option value="trial" className="bg-gray-900 text-white">Trial</option>
                            <option value="paid" className="bg-gray-900 text-white">Paid</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <Link href={`/${r.slug}`} target="_blank" className="flex-1 text-center py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-semibold transition-colors border border-white/10">
                          Preview
                        </Link>
                        <Link href={`/admin/${r.slug}`} className="flex-[2] text-center py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1 shadow-lg shadow-green-500/20">
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
                    className="mt-8 inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                  >
                    <Plus size={18} /> Register Now
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'restaurants' && (
            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
              <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <input 
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value)}
                  className="w-full sm:w-auto bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="trial">Trial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-xs uppercase font-bold text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Restaurant</th>
                      <th className="px-6 py-4">Plan & Expiry</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {restaurants
                      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .filter(r => filterPlan === 'all' || (r.subscription?.plan || 'free') === filterPlan)
                      .map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white text-base">{r.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{r.address || 'No address'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              <select 
                                value={r.subscription?.plan === 'paid' ? `paid-${r.subscription?.billingCycle || 'monthly'}` : (r.subscription?.plan || 'free')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'paid-monthly') handleUpdatePlan(r.slug, 'paid', 'monthly');
                                  else if (val === 'paid-yearly') handleUpdatePlan(r.slug, 'paid', 'yearly');
                                  else handleUpdatePlan(r.slug, val, 'none');
                                }}
                                className={`text-xs font-bold uppercase rounded-lg px-3 py-1.5 outline-none cursor-pointer border
                                  ${r.subscription?.plan === 'paid' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 
                                    r.subscription?.plan === 'trial' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 
                                    'bg-white/5 border-white/10 text-gray-400'}`}
                              >
                                <option value="free" className="bg-gray-900 text-white">FREE</option>
                                <option value="trial" className="bg-gray-900 text-white">TRIAL</option>
                                <option value="paid-monthly" className="bg-gray-900 text-white">PAID (₹199/MO)</option>
                                <option value="paid-yearly" className="bg-gray-900 text-white">PAID (₹1999/YR)</option>
                              </select>
                              {r.subscription?.plan !== 'free' && r.subscription?.validUntil && (
                                <span className="text-[10px] text-gray-500">
                                  Exp: {new Date(r.subscription.validUntil).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{r.itemCount || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                              <Link href={`/${r.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <Eye size={16} />
                              </Link>
                              <Link href={`/admin/${r.slug}`} className="p-2 text-green-500 hover:text-white bg-green-500/10 hover:bg-green-500 rounded-lg transition-colors">
                                <Settings size={16} />
                              </Link>
                              <button onClick={() => handleOpenCredentialsModal(r)} className="p-2 text-blue-500 hover:text-white bg-blue-500/10 hover:bg-blue-500 rounded-lg transition-colors">
                                <Key size={16} />
                              </button>
                              <button onClick={() => handleDeleteRestaurant(r.slug, r.name)} className="p-2 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden backdrop-blur-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
                    <Settings size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Security Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1.5">SuperAdmin Username</label>
                    <input 
                      type="text" 
                      value={platformSettings.superadminUsername || ''}
                      onChange={e => setPlatformSettings({...platformSettings, superadminUsername: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1.5">SuperAdmin Password</label>
                    <input 
                      type="text" 
                      value={platformSettings.superadminPassword || ''}
                      onChange={e => setPlatformSettings({...platformSettings, superadminPassword: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                    />
                    <p className="text-xs text-green-400 mt-2">* Stored securely in database. Modifying this changes login credentials immediately.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden backdrop-blur-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <LayoutDashboard size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Platform Limits</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1.5">Free Plan Item Limit</label>
                    <input 
                      type="number" 
                      value={platformSettings.freePlanItemLimit || ''}
                      onChange={e => setPlatformSettings({...platformSettings, freePlanItemLimit: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1.5">Trial Duration (Days)</label>
                    <input 
                      type="number" 
                      value={platformSettings.trialDurationDays || ''}
                      onChange={e => setPlatformSettings({...platformSettings, trialDurationDays: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-400 transition-colors flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
                  >
                    {isSavingSettings ? "Saving..." : "Save Configuration"}
                  </button>
                </div>
              </div>
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
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Restaurant Name <span className="text-green-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                  placeholder="e.g. The Spicy Kitchen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Address <span className="text-green-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
                  placeholder="e.g. 123 Main St, City"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Admin Password <span className="text-green-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={formData.adminPassword} 
                  onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all shadow-inner"
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
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-green-500 hover:bg-green-400 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-green-500/20">
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

      {/* Credentials Modal */}
      {isCredentialsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] rounded-3xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-extrabold text-white flex items-center gap-2">
                <Key size={18} className="text-blue-500" /> Manage Credentials
              </h3>
              <button onClick={() => setIsCredentialsModalOpen(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCredentials} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Username <span className="text-blue-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={credentialsData.username} 
                  onChange={e => setCredentialsData({...credentialsData, username: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                  placeholder="Login Username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password <span className="text-blue-500">*</span></label>
                <input 
                  required
                  type="text" 
                  value={credentialsData.password} 
                  onChange={e => setCredentialsData({...credentialsData, password: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                  placeholder="Login Password"
                />
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsCredentialsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingCredentials} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-400 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20">
                  {isSavingCredentials ? "Saving..." : "Update Credentials"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
