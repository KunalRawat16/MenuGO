"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { FileUpload } from "@/components/ui/FileUpload";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";
import {
  getCategoriesAction,
  createCategoryAction,
  deleteCategoryAction,
  getMenuItemsAction,
  saveMenuItemAction,
  deleteMenuItemAction,
  toggleItemAvailabilityAction,
} from "@/app/actions/menu.actions";

export default function MenuEditorPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    dietary: "veg",
    image: "",
    isAvailable: true,
    isPopular: false,
    tags: "",
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const bizRes = await getMyBusinessAction();
      if (bizRes.success && bizRes.business) {
        setBusiness(bizRes.business);

        const [catRes, itemsRes] = await Promise.all([
          getCategoriesAction(bizRes.business._id),
          getMenuItemsAction(bizRes.business._id),
        ]);

        if (catRes.categories) setCategories(catRes.categories);
        if (itemsRes.items) setItems(itemsRes.items);
      }
    } catch (err) {
      console.error("Menu editor fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category operations
  const handleAddCategory = async () => {
    if (!newCatName.trim() || !business?._id) return;
    try {
      const res = await createCategoryAction(business._id, newCatName.trim());
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category]);
        setNewCatName("");
        setIsCatModalOpen(false);
      }
    } catch (err) {
      console.error("Add category error:", err);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure? Items in this category will become uncategorized.") || !business?._id) return;
    try {
      await deleteCategoryAction(business._id, catId);
      setCategories((prev) => prev.filter((c) => c._id !== catId));
      if (selectedCategoryId === catId) setSelectedCategoryId(null);
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  // Item Modal Handlers
  const handleOpenItemModal = (itemToEdit?: any) => {
    setError(null);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setItemFormData({
        name: itemToEdit.name || "",
        description: itemToEdit.description || "",
        price: itemToEdit.price ? String(itemToEdit.price) : "",
        categoryId: itemToEdit.categoryId || categories[0]?._id || "",
        dietary: itemToEdit.dietary || "veg",
        image: itemToEdit.image || "",
        isAvailable: itemToEdit.isAvailable !== false,
        isPopular: !!itemToEdit.isPopular,
        tags: itemToEdit.tags?.join(", ") || "",
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: "",
        description: "",
        price: "",
        categoryId: selectedCategoryId || categories[0]?._id || "",
        dietary: "veg",
        image: "",
        isAvailable: true,
        isPopular: false,
        tags: "",
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.price || !itemFormData.categoryId || !business?._id) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSavingItem(true);
    setError(null);

    try {
      const payload = {
        _id: editingItem?._id,
        name: itemFormData.name.trim(),
        description: itemFormData.description.trim(),
        price: parseFloat(itemFormData.price),
        categoryId: itemFormData.categoryId,
        dietary: itemFormData.dietary,
        image: itemFormData.image || null,
        isAvailable: itemFormData.isAvailable,
        isPopular: itemFormData.isPopular,
        tags: itemFormData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await saveMenuItemAction(business._id, payload);

      if (res.error) {
        setError(res.error);
        setIsSavingItem(false);
      } else if (res.success && res.item) {
        if (editingItem) {
          setItems((prev) => prev.map((i) => (i._id === res.item._id ? res.item : i)));
        } else {
          setItems((prev) => [...prev, res.item]);
        }
        setIsItemModalOpen(false);
        setIsSavingItem(false);
      }
    } catch (err) {
      console.error("Save item error:", err);
      setError("Failed to save menu item.");
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?") || !business?._id) return;
    try {
      await deleteMenuItemAction(business._id, itemId);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      console.error("Delete item error:", err);
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    if (!business?._id) return;
    const nextStatus = !currentStatus;

    setItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, isAvailable: nextStatus } : i))
    );

    try {
      await toggleItemAvailabilityAction(business._id, itemId, nextStatus);
    } catch {
      setItems((prev) =>
        prev.map((i) => (i._id === itemId ? { ...i, isAvailable: currentStatus } : i))
      );
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const currencySymbol = business?.localization?.currencySymbol || "₹";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Menu Management & Catalog Editor
          </h1>
          <p className="text-xs text-slate-500">
            Create categories, manage items, set prices & toggle item availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCatModalOpen(true)}
            leftIcon={<Plus size={14} />}
          >
            Add Category
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleOpenItemModal()}
            leftIcon={<Plus size={14} />}
          >
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Mobile Category Tab Bar for Android Users */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategoryId === null
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200"
          }`}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.categoryId === cat._id).length;
          return (
            <button
              key={cat._id}
              onClick={() => setSelectedCategoryId(cat._id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategoryId === cat._id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Grid: Categories Panel (Left) + Items List (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Column: Categories List (Desktop Only) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
              Categories ({categories.length})
            </h2>
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              + New
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                selectedCategoryId === null
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>All Categories</span>
              <span className="text-[10px] opacity-80">({items.length})</span>
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat._id).length;
              const isSelected = selectedCategoryId === cat._id;

              return (
                <div
                  key={cat._id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className="flex-1 text-left truncate"
                  >
                    {cat.name} ({count})
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isSelected ? "text-indigo-200 hover:text-white" : "text-slate-400 hover:text-rose-600"
                    }`}
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Menu Items Panel */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          {/* Search Bar */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredItems.length} items
            </span>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <p className="text-sm font-bold text-slate-700">No items found</p>
              <p className="text-xs">Click "Add Menu Item" above to create your first dish.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🍽️
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                        {item.dietary === "veg" && <Badge variant="success" size="sm">Veg</Badge>}
                        {item.dietary === "non-veg" && <Badge variant="danger" size="sm">Non-Veg</Badge>}
                        {item.dietary === "vegan" && <Badge variant="info" size="sm">Vegan</Badge>}
                        {item.isPopular && <Badge variant="accent" size="sm">Popular</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.description || "No description provided"}
                      </p>
                      <p className="text-xs font-extrabold text-indigo-600 font-heading">
                        {currencySymbol}
                        {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Availability Switch */}
                  <div className="flex items-center gap-3">
                    {/* Availability Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                      title="Toggle availability"
                    >
                      {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{item.isAvailable ? "In Stock" : "Sold Out"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenItemModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ADD CATEGORY MODAL
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add New Category"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g., Main Course or Hair Spa"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleAddCategory}>
              Create Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          ADD / EDIT MENU ITEM MODAL
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? "Edit Menu Item" : "Add New Menu Item"}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name *"
              placeholder="e.g. Tandoori Paneer Tikka"
              value={itemFormData.name}
              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
              required
            />

            <Input
              label={`Price (${currencySymbol}) *`}
              type="number"
              step="0.01"
              placeholder="299.00"
              value={itemFormData.price}
              onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Category *
              </label>
              <select
                value={itemFormData.categoryId}
                onChange={(e) => setItemFormData({ ...itemFormData, categoryId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Dietary Type
              </label>
              <select
                value={itemFormData.dietary}
                onChange={(e) => setItemFormData({ ...itemFormData, dietary: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="veg">🟢 Pure Veg</option>
                <option value="non-veg">🔴 Non-Veg</option>
                <option value="vegan">🌿 Vegan</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Short description of ingredients or dish details..."
              value={itemFormData.description}
              onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Upload */}
          <FileUpload
            label="Dish / Service Thumbnail Image"
            currentUrl={itemFormData.image}
            onUploadSuccess={(url) => setItemFormData({ ...itemFormData, image: url })}
            folder="menugo/dishes"
            aspectRatio="square"
          />

          <Input
            label="Tags (comma-separated)"
            placeholder="spicy, chef-special, gluten-free"
            value={itemFormData.tags}
            onChange={(e) => setItemFormData({ ...itemFormData, tags: e.target.value })}
          />

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={itemFormData.isAvailable}
                onChange={(e) => setItemFormData({ ...itemFormData, isAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>In Stock / Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={itemFormData.isPopular}
                onChange={(e) => setItemFormData({ ...itemFormData, isPopular: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>⭐ Mark as Popular</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" isLoading={isSavingItem}>
              {editingItem ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
