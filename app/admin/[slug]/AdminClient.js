"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, QrCode, X, Check, Eye, Settings, CreditCard, LayoutList, Info, Menu, ShoppingBag, MapPin, Star, Timer, IndianRupee, Store } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { saveMenuItemAction, deleteMenuItemAction, updateRestaurantInfoAction, uploadImageAction, logoutAction, updateRestaurantCategoriesAction } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import OrdersDashboard from "@/components/admin/OrdersDashboard";

export default function AdminClient({ restaurant }) {
  const router = useRouter();
  const [items, setItems] = useState(restaurant.menuItems);
  const [activeTab, setActiveTab] = useState("orders"); // "orders", "menu" or "info"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const subscription = restaurant.subscription || { plan: 'free' };
  const isRestricted = subscription.plan === 'free';
  const FREE_ITEM_LIMIT = 10;
  const canAddItem = !isRestricted || items.length < FREE_ITEM_LIMIT;
  const [editingItem, setEditingItem] = useState(null);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: restaurant.name,
    address: restaurant.address,
    logo: restaurant.logo,
    banner: restaurant.banner || "",
    rating: restaurant.rating || 4.2,
    avgTime: restaurant.avgTime || "20-30 mins",
    costForOne: restaurant.costForOne || 200,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [categories, setCategories] = useState(restaurant.categories || []);
  const [newCategory, setNewCategory] = useState("");
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  const qrRef = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate full URL for QR code on client side
    setQrUrl(`${window.location.origin}/${restaurant.slug}`);
  }, [restaurant.slug]);

  const handleOpenModal = (item = null) => {
    if (!item && !canAddItem) {
      alert("You have reached the item limit for the free plan. Please upgrade to add more items.");
      setShowUpgradeModal(true);
      return;
    }
    if (item) {
      setEditingItem({ ...item });
    } else {
      setEditingItem({
        id: "",
        name: "",
        price: "",
        image: "",
        category: categories[0] || "",
        isVeg: true,
        isAvailable: true,
        isPopular: false,
        description: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedImageFile(null);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let imageUrl = editingItem.image;
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("file", selectedImageFile);
      const uploadRes = await uploadImageAction(formData);
      if (uploadRes.success) {
        imageUrl = uploadRes.url;
      } else {
        alert(uploadRes.error || "Failed to upload image");
        setIsLoading(false);
        return;
      }
    }

    // Ensure price is a number
    const itemToSave = {
      ...editingItem,
      price: Number(editingItem.price),
      image: imageUrl,
    };

    const res = await saveMenuItemAction(restaurant.slug, itemToSave);
    if (res.success) {
      // Optimistic update
      if (itemToSave.id) {
        setItems(items.map(i => i.id === itemToSave.id ? itemToSave : i));
      } else {
        // Just reload page to get new ID from server for simplicity in MVP
        window.location.reload();
      }
      handleCloseModal();
    } else {
      alert("Error saving item");
    }
    setIsLoading(false);
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await deleteMenuItemAction(restaurant.slug, id);
    if (res.success) {
      setItems(items.filter(i => i.id !== id));
    } else {
      alert("Error deleting item");
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);

    let logoUrl = restaurantInfo.logo;
    if (selectedLogoFile) {
      const formData = new FormData();
      formData.append("file", selectedLogoFile);
      const res = await uploadImageAction(formData);
      if (res.success) logoUrl = res.url;
    }

    let bannerUrl = restaurantInfo.banner;
    if (selectedBannerFile) {
      const formData = new FormData();
      formData.append("file", selectedBannerFile);
      const res = await uploadImageAction(formData);
      if (res.success) bannerUrl = res.url;
    }

    const res = await updateRestaurantInfoAction(restaurant.slug, {
      ...restaurantInfo,
      logo: logoUrl,
      banner: bannerUrl,
      rating: Number(restaurantInfo.rating),
      costForOne: Number(restaurantInfo.costForOne)
    });
    if (res.success) {
      window.location.reload(); // simple reload to show updated settings
    } else {
      alert("Error saving settings");
    }
    setIsSavingSettings(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert("Category already exists");
      return;
    }
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
  };

  const handleDeleteCategory = (catToDelete) => {
    // Check if any items are in this category
    const itemsInCat = items.filter(i => i.category === catToDelete);
    if (itemsInCat.length > 0) {
      if (!confirm(`There are ${itemsInCat.length} items in this category. Deleting the category will not delete the items, but they will be unassigned. Continue?`)) return;
    }
    setCategories(categories.filter(c => c !== catToDelete));
  };

  const handleSaveCategories = async () => {
    setIsSavingCategories(true);
    const res = await updateRestaurantCategoriesAction(restaurant.slug, categories);
    if (res.success) {
      alert("Categories updated successfully!");
    } else {
      alert("Error updating categories");
    }
    setIsSavingCategories(false);
  };

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${restaurant.slug}-menu-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-500/30 pb-20" suppressHydrationWarning>
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-xl border border-gray-200 overflow-hidden bg-white">
              {restaurant.logo ? (
                <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Menu size={16} className="text-gray-400" />
                </div>
              )}
            </div>
            <h1 className="font-bold text-lg hidden sm:block">{restaurant.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${restaurant.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors">
              <Eye size={16} /> <span className="hidden sm:inline">Preview Menu</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Subscription Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider">{subscription.plan} Plan</span>
            </div>
            <p className="text-sm font-medium text-indigo-900">
              {isRestricted ? `Your current plan has a limit of ${FREE_ITEM_LIMIT} items.` : (
                mounted ? `Premium features active until: ${new Date(subscription.validUntil).toLocaleDateString()}` : "Loading subscription details..."
              )}
            </p>
          </div>
          {subscription.plan !== 'paid' && (
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Membership Management</span>
              <p className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm">
                Contact Platform Admin to upgrade
              </p>
            </div>
          )}
        </div>

        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Dashboard</h2>
            <p className="text-gray-500 font-medium mt-1">Manage your menu, settings, and QR codes.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={downloadQR}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-bold text-gray-700 transition-all shadow-sm"
            >
              <QrCode size={18} /> Download QR
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-orange-200"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>
        </div>

        {/* Hidden QR Code for downloading */}
        <div className="hidden" ref={qrRef}>
          {qrUrl && <QRCodeCanvas value={qrUrl} size={512} level="H" />}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === "orders" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            <ShoppingBag size={18} /> Live Orders
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === "menu" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            <LayoutList size={18} /> Menu Items
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-colors ${activeTab === "info" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            <Info size={18} /> Restaurant Info
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <OrdersDashboard restaurantId={restaurant._id} slug={restaurant.slug} />
        )}

        {activeTab === "menu" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Item</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-4">
                  {/* Item Info */}
                  <div className="md:col-span-5 flex items-start md:items-center gap-4">
                    <div className="relative w-16 h-16 md:w-12 md:h-12 flex-shrink-0 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      <Image src={item.image} alt="" fill sizes="(max-width: 768px) 64px, 48px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="line-clamp-1">{item.name}</span>
                        <div className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                      {item.isPopular && <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-1.5 py-0.5 rounded flex w-max font-bold mt-1 shadow-sm">POPULAR</span>}

                      {/* Mobile only elements */}
                      <div className="md:hidden mt-2 text-sm flex items-center gap-2">
                        <span className="text-gray-500 font-medium">{item.category}</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-2 text-sm font-medium text-gray-600">{item.category}</div>
                  <div className="hidden md:block md:col-span-2 text-sm font-extrabold text-gray-900">₹{item.price}</div>

                  <div className="md:col-span-2 flex justify-between items-center md:block pt-2 md:pt-0">
                    <span className="md:hidden text-sm text-gray-500 font-medium">Availability:</span>
                    {item.isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                        <Check size={12} strokeWidth={3} /> Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-full">
                        <X size={12} strokeWidth={3} /> Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex justify-end gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-0">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-1 md:flex-none flex justify-center items-center">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-1 md:flex-none flex justify-center items-center">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <LayoutList size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No items yet</h3>
                  <p className="text-gray-500 mt-1">Start building your menu by adding your first item.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-200 bg-gray-50/50">
              <h3 className="text-xl font-extrabold text-gray-900">Restaurant Settings</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Update your public profile and branding details.</p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl mx-auto">
                {/* Basic Details Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Store size={16} className="text-orange-500" /> Restaurant Name
                      </label>
                      <input
                        required
                        type="text"
                        value={restaurantInfo.name}
                        onChange={e => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <MapPin size={16} className="text-orange-500" /> Location / Address
                      </label>
                      <textarea
                        required
                        rows={1}
                        value={restaurantInfo.address}
                        onChange={e => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400 resize-none"
                        placeholder="e.g. 123 Street Name, City"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" /> Rating (1-5)
                      </label>
                      <input
                        required
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={restaurantInfo.rating}
                        onChange={e => setRestaurantInfo({ ...restaurantInfo, rating: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400"
                        placeholder="e.g. 4.5"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Timer size={16} className="text-blue-500" /> Prep Time
                      </label>
                      <input
                        required
                        type="text"
                        value={restaurantInfo.avgTime}
                        onChange={e => setRestaurantInfo({ ...restaurantInfo, avgTime: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400"
                        placeholder="e.g. 20-30 mins"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <IndianRupee size={16} className="text-green-600" /> Cost for One
                      </label>
                      <input
                        required
                        type="number"
                        value={restaurantInfo.costForOne}
                        onChange={e => setRestaurantInfo({ ...restaurantInfo, costForOne: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400"
                        placeholder="e.g. 250"
                      />
                    </div>
                  </div>
                </div>

                {/* Branding Section */}
                <div className="p-6 bg-gray-50/80 rounded-3xl border border-gray-200 space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                    <div>
                      <h4 className="font-extrabold text-gray-900">Branding & Visuals</h4>
                      <p className="text-xs text-gray-500 font-medium">Customize your restaurant's digital appearance.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex justify-between">
                        Banner Image {isRestricted && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Premium</span>}
                      </label>
                      <div className={`space-y-3 ${isRestricted ? 'opacity-60 pointer-events-none' : ''}`}>
                        <input
                          type="text"
                          value={restaurantInfo.banner}
                          onChange={e => setRestaurantInfo({ ...restaurantInfo, banner: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 outline-none bg-white shadow-sm transition-all hover:border-gray-400"
                          disabled={isRestricted}
                          placeholder="Image URL..."
                        />
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedBannerFile(e.target.files[0]);
                                setRestaurantInfo({ ...restaurantInfo, banner: "" });
                              }
                            }}
                            className="hidden"
                            id="banner-upload"
                            disabled={isRestricted}
                          />
                          <label
                            htmlFor="banner-upload"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 cursor-pointer hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/30 transition-all bg-white"
                          >
                            Upload New Banner
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full sm:w-auto px-12 py-4 text-sm font-black text-white bg-gray-900 hover:bg-black rounded-2xl transition-all shadow-2xl shadow-gray-200 active:scale-95 disabled:opacity-50"
                  >
                    {isSavingSettings ? "Saving Changes..." : "Update Restaurant Info"}
                  </button>
                </div>
              </form>
            </div>

            {/* Category Management Section */}
            <div className="p-8 border-t border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Menu Categories</h3>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Manage and organize your menu grouping.</p>
                </div>
              </div>

              <div className="max-w-4xl space-y-8 mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    placeholder="e.g. Signature Starters"
                    className="w-full sm:flex-1 border border-gray-300 rounded-xl px-5 py-4 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm bg-white hover:border-gray-400"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="w-full sm:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add Category
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categories.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm group hover:border-orange-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <span className="text-sm font-black text-gray-800 tracking-tight">{cat}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-end">
                  <button
                    onClick={handleSaveCategories}
                    disabled={isSavingCategories}
                    className="w-full sm:w-auto px-12 py-4 text-sm font-black text-white bg-green-600 hover:bg-green-700 rounded-2xl transition-all shadow-2xl shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSavingCategories ? "Processing..." : (
                      <>
                        <Check size={20} /> Save Categories
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button for Mobile */}
      {activeTab === "menu" && (
        <button
          onClick={() => handleOpenModal()}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-600 transition-transform hover:scale-105 active:scale-95 z-40"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h2 className="font-extrabold text-xl text-gray-900">
                {editingItem.id ? "Edit Item" : "Add New Item"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Name</label>
                <input
                  required
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                  placeholder="e.g. Butter Chicken"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={editingItem.price}
                    onChange={e => setEditingItem({ ...editingItem, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    placeholder="e.g. 250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow bg-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Image URL or Upload</label>
                <div className="flex flex-col gap-3">
                  <input
                    type="url"
                    value={editingItem.image}
                    onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    placeholder="https://..."
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedImageFile(e.target.files[0]);
                        setEditingItem({ ...editingItem, image: "" });
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none h-24 transition-shadow"
                  placeholder="Short description of the item..."
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={editingItem.isVeg}
                      onChange={e => setEditingItem({ ...editingItem, isVeg: e.target.checked })}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-green-500 checked:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all cursor-pointer"
                    />
                    <Check size={14} strokeWidth={4} className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white transform scale-50 peer-checked:scale-100 transition-all" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Vegetarian (Veg)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={editingItem.isAvailable}
                      onChange={e => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                    />
                    <Check size={14} strokeWidth={4} className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white transform scale-50 peer-checked:scale-100 transition-all" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Available (In Stock)</span>
                </label>

                <label className={`flex items-center gap-3 group ${isRestricted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={editingItem.isPopular}
                      onChange={e => setEditingItem({ ...editingItem, isPopular: e.target.checked })}
                      disabled={isRestricted}
                      className="peer appearance-none w-5 h-5 border-2 border-gray-400 rounded-md checked:bg-yellow-500 checked:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition-all cursor-pointer"
                    />
                    <Check size={14} strokeWidth={4} className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white transform scale-50 peer-checked:scale-100 transition-all" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">
                    Mark as Popular {isRestricted && <span className="text-xs font-normal text-red-500 ml-1">(Premium feature)</span>}
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-md disabled:opacity-50 min-w-[120px]">
                  {isLoading ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
