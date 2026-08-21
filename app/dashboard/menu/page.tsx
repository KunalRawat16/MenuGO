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
  Settings,
  Layers,
  Zap,
  FolderCheck,
  Ruler,
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
  getGlobalAddonsAction,
  saveGlobalAddonsAction,
  applyAddonsToCategoryAction,
  getGlobalVariantsAction,
  saveGlobalVariantsAction,
  applyVariantsToCategoryAction,
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
    hasVariants: false,
    variants: [] as { name: string; price: string }[],
    hasAddons: false,
    addons: [] as { name: string; price: string }[],
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global Add-ons Master Library State
  const [globalAddons, setGlobalAddons] = useState<{ name: string; price: string; groupName?: string }[]>([]);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isSavingGlobalAddons, setIsSavingGlobalAddons] = useState(false);
  const [isApplyingToCategory, setIsApplyingToCategory] = useState(false);
  const [globalAddonMessage, setGlobalAddonMessage] = useState<string | null>(null);
  const [globalAddonBulkCatId, setGlobalAddonBulkCatId] = useState<string>("");

  // Global Variant Master Library State
  const [globalVariants, setGlobalVariants] = useState<
    { templateName: string; variants: { name: string; price: string }[] }[]
  >([]);
  const [isGlobalVariantsModalOpen, setIsGlobalVariantsModalOpen] = useState(false);
  const [isSavingGlobalVariants, setIsSavingGlobalVariants] = useState(false);
  const [isApplyingVariantsToCategory, setIsApplyingVariantsToCategory] = useState(false);
  const [globalVariantMessage, setGlobalVariantMessage] = useState<string | null>(null);
  const [globalVariantBulkCatMap, setGlobalVariantBulkCatMap] = useState<{ [key: number]: string }>({});

  // Fetch initial data
  const fetchData = async () => {
    try {
      const bizRes = await getMyBusinessAction();
      if (bizRes.success && bizRes.business) {
        setBusiness(bizRes.business);

        const [catRes, itemsRes, globalRes, variantRes] = await Promise.all([
          getCategoriesAction(bizRes.business._id),
          getMenuItemsAction(bizRes.business._id),
          getGlobalAddonsAction(bizRes.business._id),
          getGlobalVariantsAction(bizRes.business._id),
        ]);

        if (catRes.categories) setCategories(catRes.categories);
        if (itemsRes.items) setItems(itemsRes.items);
        if (globalRes.globalAddons) {
          setGlobalAddons(
            globalRes.globalAddons.map((g: any) => ({
              name: g.name,
              price: String(g.price),
              groupName: g.groupName || "General",
            }))
          );
        }
        if (variantRes.globalVariants) {
          setGlobalVariants(
            variantRes.globalVariants.map((t: any) => ({
              templateName: t.templateName,
              variants: t.variants?.map((v: any) => ({ name: v.name, price: String(v.price) })) || [],
            }))
          );
        }
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
        hasVariants: !!itemToEdit.hasVariants,
        variants: itemToEdit.variants?.length
          ? itemToEdit.variants.map((v: any) => ({ name: v.name, price: String(v.price) }))
          : [],
        hasAddons: !!itemToEdit.hasAddons,
        addons: itemToEdit.addons?.length
          ? itemToEdit.addons.map((a: any) => ({ name: a.name, price: String(a.price) }))
          : [],
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
        hasVariants: false,
        variants: [],
        hasAddons: false,
        addons: [],
      });
    }
    setIsItemModalOpen(true);
  };

  const handleAddVariantRow = (name = "", price = "") => {
    setItemFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name, price }],
    }));
  };

  const handleUpdateVariantRow = (index: number, field: "name" | "price", value: string) => {
    setItemFormData((prev) => {
      const copy = [...prev.variants];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, variants: copy };
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setItemFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Add-on Handlers
  const handleAddAddonRow = (name = "", price = "") => {
    setItemFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, { name, price }],
    }));
  };

  const handleUpdateAddonRow = (index: number, field: "name" | "price", value: string) => {
    setItemFormData((prev) => {
      const copy = [...prev.addons];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, addons: copy };
    });
  };

  const handleRemoveAddonRow = (index: number) => {
    setItemFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
  };

  // Global Master Add-on Handlers
  const handleAddGlobalAddonRow = (name = "", price = "", groupName = "General") => {
    setGlobalAddons((prev) => [...prev, { name, price, groupName }]);
  };

  const handleUpdateGlobalAddonRow = (
    index: number,
    field: "name" | "price" | "groupName",
    value: string
  ) => {
    setGlobalAddons((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveGlobalAddonRow = (index: number) => {
    setGlobalAddons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveGlobalAddons = async () => {
    if (!business?._id) return;
    setIsSavingGlobalAddons(true);
    setGlobalAddonMessage(null);
    try {
      const sanitized = globalAddons
        .map((g) => ({
          name: g.name.trim(),
          price: parseFloat(g.price) || 0,
          groupName: g.groupName?.trim() || "General",
        }))
        .filter((g) => g.name);

      const res = await saveGlobalAddonsAction(business._id, sanitized);
      if (res.error) {
        setGlobalAddonMessage(`⚠️ ${res.error}`);
      } else if (res.success && res.globalAddons) {
        setGlobalAddons(
          res.globalAddons.map((g: any) => ({
            name: g.name,
            price: String(g.price),
            groupName: g.groupName || "General",
          }))
        );
        setGlobalAddonMessage("✅ Global Add-ons saved successfully!");
        setTimeout(() => setGlobalAddonMessage(null), 2500);
      }
    } catch (err) {
      console.error("Save global addons error:", err);
      setGlobalAddonMessage("⚠️ Failed to save global add-ons.");
    } finally {
      setIsSavingGlobalAddons(false);
    }
  };

  // 1-Click Toggle Global Add-on into current Item Form
  const handleToggleGlobalAddonToItem = (name: string, price: string) => {
    setItemFormData((prev) => {
      const exists = prev.addons.some((a) => a.name.toLowerCase() === name.toLowerCase());
      const nextAddons = exists
        ? prev.addons.filter((a) => a.name.toLowerCase() !== name.toLowerCase())
        : [...prev.addons, { name, price }];

      return {
        ...prev,
        hasAddons: nextAddons.length > 0,
        addons: nextAddons,
      };
    });
  };

  // Select all global master add-ons into current Item Form
  const handleSelectAllGlobalAddons = () => {
    if (globalAddons.length === 0) return;
    setItemFormData((prev) => {
      const map = new Map<string, string>();
      prev.addons.forEach((a) => map.set(a.name.toLowerCase(), a.price));
      globalAddons.forEach((g) => {
        if (g.name.trim()) map.set(g.name.trim().toLowerCase(), g.price);
      });

      const merged: { name: string; price: string }[] = [];
      globalAddons.forEach((g) => {
        if (g.name.trim() && map.has(g.name.trim().toLowerCase())) {
          merged.push({ name: g.name.trim(), price: map.get(g.name.trim().toLowerCase())! });
          map.delete(g.name.trim().toLowerCase());
        }
      });
      prev.addons.forEach((a) => {
        if (map.has(a.name.toLowerCase())) {
          merged.push(a);
        }
      });

      return {
        ...prev,
        hasAddons: merged.length > 0,
        addons: merged,
      };
    });
  };

  // Bulk Apply Add-ons to Category
  const handleApplyAddonsToCategory = async (overrideCatId?: string, overrideAddons?: { name: string; price: string }[]) => {
    const targetCatId = typeof overrideCatId === "string" ? overrideCatId : itemFormData.categoryId;
    const catIdStr = typeof targetCatId === "object" ? (targetCatId as any)?._id : String(targetCatId || "");
    if (!business?._id || !catIdStr) {
      alert("⚠️ Please select a valid category first.");
      return;
    }

    const addonsToApply = Array.isArray(overrideAddons) ? overrideAddons : itemFormData.addons;
    if (addonsToApply.length === 0) {
      alert("⚠️ No add-ons available to apply.");
      return;
    }

    const cat = categories.find((c) => String(c._id) === catIdStr);
    const catName = cat ? cat.name : "selected category";

    if (
      !confirm(
        `Are you sure you want to apply these ${addonsToApply.length} Add-on(s) to ALL items in "${catName}"?`
      )
    ) {
      return;
    }

    setIsApplyingToCategory(true);
    try {
      const sanitized = addonsToApply
        .map((a) => ({ name: a.name.trim(), price: parseFloat(a.price) || 0 }))
        .filter((a) => a.name);

      const res = await applyAddonsToCategoryAction(business._id, catIdStr, sanitized);
      if (res.success) {
        await fetchData();
        alert(`✅ Successfully updated add-ons for all items in "${catName}"! (${res.count ?? 0} items modified)`);
      } else if (res.error) {
        alert(`⚠️ ${res.error}`);
      }
    } catch (err) {
      console.error("Apply addons to category error:", err);
      alert("⚠️ Failed to bulk apply add-ons.");
    } finally {
      setIsApplyingToCategory(false);
    }
  };

  // Global Variant Master Library Handlers
  const handleAddGlobalVariantTemplate = (
    templateName = "Portion Sizes",
    variants = [
      { name: "Half", price: "150" },
      { name: "Full", price: "280" },
    ]
  ) => {
    setGlobalVariants((prev) => [...prev, { templateName, variants }]);
  };

  const handleUpdateGlobalVariantTemplateName = (index: number, templateName: string) => {
    setGlobalVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], templateName };
      return copy;
    });
  };

  const handleAddVariantToTemplate = (templateIndex: number, name = "", price = "") => {
    setGlobalVariants((prev) => {
      const copy = [...prev];
      copy[templateIndex].variants = [...copy[templateIndex].variants, { name, price }];
      return copy;
    });
  };

  const handleUpdateVariantInTemplate = (
    templateIndex: number,
    variantIndex: number,
    field: "name" | "price",
    value: string
  ) => {
    setGlobalVariants((prev) => {
      const copy = [...prev];
      const vars = [...copy[templateIndex].variants];
      vars[variantIndex] = { ...vars[variantIndex], [field]: value };
      copy[templateIndex].variants = vars;
      return copy;
    });
  };

  const handleRemoveVariantFromTemplate = (templateIndex: number, variantIndex: number) => {
    setGlobalVariants((prev) => {
      const copy = [...prev];
      copy[templateIndex].variants = copy[templateIndex].variants.filter((_, i) => i !== variantIndex);
      return copy;
    });
  };

  const handleRemoveGlobalVariantTemplate = (templateIndex: number) => {
    setGlobalVariants((prev) => prev.filter((_, i) => i !== templateIndex));
  };

  const handleSaveGlobalVariants = async () => {
    if (!business?._id) return;
    setIsSavingGlobalVariants(true);
    setGlobalVariantMessage(null);
    try {
      const sanitized = globalVariants
        .map((t) => ({
          templateName: t.templateName.trim(),
          variants: t.variants
            .map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) || 0 }))
            .filter((v) => v.name),
        }))
        .filter((t) => t.templateName && t.variants.length > 0);

      const res = await saveGlobalVariantsAction(business._id, sanitized);
      if (res.error) {
        setGlobalVariantMessage(`⚠️ ${res.error}`);
      } else if (res.success && res.globalVariants) {
        setGlobalVariants(
          res.globalVariants.map((t: any) => ({
            templateName: t.templateName,
            variants: t.variants?.map((v: any) => ({ name: v.name, price: String(v.price) })) || [],
          }))
        );
        setGlobalVariantMessage("✅ Global Variant Templates saved successfully!");
        setTimeout(() => setGlobalVariantMessage(null), 2500);
      }
    } catch (err) {
      console.error("Save global variants error:", err);
      setGlobalVariantMessage("⚠️ Failed to save global variant templates.");
    } finally {
      setIsSavingGlobalVariants(false);
    }
  };

  // 1-Click Import Global Variant Template into Item Form
  const handleImportVariantTemplateToItem = (variants: { name: string; price: string }[]) => {
    if (!variants || variants.length === 0) return;
    setItemFormData((prev) => ({
      ...prev,
      hasVariants: true,
      variants: variants.map((v) => ({ name: v.name, price: v.price })),
    }));
  };

  // Bulk Apply Variants to Category
  const handleApplyVariantsToCategory = async (overrideCatId?: string, overrideVariants?: { name: string; price: string }[]) => {
    const targetCatId = typeof overrideCatId === "string" ? overrideCatId : itemFormData.categoryId;
    const catIdStr = typeof targetCatId === "object" ? (targetCatId as any)?._id : String(targetCatId || "");
    if (!business?._id || !catIdStr) {
      alert("⚠️ Please select a valid category first.");
      return;
    }

    const variantsToApply = Array.isArray(overrideVariants) ? overrideVariants : itemFormData.variants;
    if (variantsToApply.length === 0) {
      alert("⚠️ Please add at least one variant option to apply.");
      return;
    }

    const cat = categories.find((c) => String(c._id) === catIdStr);
    const catName = cat ? cat.name : "selected category";

    if (
      !confirm(
        `Are you sure you want to apply these ${variantsToApply.length} Variant(s) to ALL items in "${catName}"?`
      )
    ) {
      return;
    }

    setIsApplyingVariantsToCategory(true);
    try {
      const sanitized = variantsToApply
        .map((v) => ({ name: v.name.trim(), price: parseFloat(v.price) || 0 }))
        .filter((v) => v.name);

      const res = await applyVariantsToCategoryAction(business._id, catIdStr, sanitized);
      if (res.success) {
        await fetchData();
        alert(`✅ Successfully updated size variants for all items in "${catName}"! (${res.count ?? 0} items modified)`);
      } else if (res.error) {
        alert(`⚠️ ${res.error}`);
      }
    } catch (err) {
      console.error("Apply variants to category error:", err);
      alert("⚠️ Failed to bulk apply variants.");
    } finally {
      setIsApplyingVariantsToCategory(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.categoryId || !business?._id) {
      setError("Please fill in item name and category.");
      return;
    }

    if (!itemFormData.hasVariants && !itemFormData.price) {
      setError("Please enter item price.");
      return;
    }

    if (itemFormData.hasVariants) {
      if (itemFormData.variants.length === 0) {
        setError("Please add at least one price variant (e.g. Small / Large or Half / Full).");
        return;
      }
      for (const v of itemFormData.variants) {
        if (!v.name.trim() || !v.price || isNaN(parseFloat(v.price))) {
          setError("All variants must have valid names and numbers for price.");
          return;
        }
      }
    }

    if (itemFormData.hasAddons) {
      if (itemFormData.addons.length === 0) {
        setError("Please add at least one add-on option (e.g. Extra Cheese - ₹30).");
        return;
      }
      for (const a of itemFormData.addons) {
        if (!a.name.trim() || a.price === "" || isNaN(parseFloat(a.price))) {
          setError("All add-ons must have valid names and prices.");
          return;
        }
      }
    }

    setIsSavingItem(true);
    setError(null);

    try {
      const basePrice = itemFormData.hasVariants
        ? parseFloat(itemFormData.variants[0]?.price || "0")
        : parseFloat(itemFormData.price);

      const payload = {
        _id: editingItem?._id,
        name: itemFormData.name.trim(),
        description: itemFormData.description.trim(),
        price: basePrice,
        categoryId: itemFormData.categoryId,
        dietary: itemFormData.dietary,
        image: itemFormData.image || null,
        isAvailable: itemFormData.isAvailable,
        isPopular: itemFormData.isPopular,
        tags: itemFormData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        hasVariants: itemFormData.hasVariants,
        variants: itemFormData.hasVariants
          ? itemFormData.variants.map((v) => ({
              name: v.name.trim(),
              price: parseFloat(v.price),
            }))
          : [],
        hasAddons: itemFormData.hasAddons,
        addons: itemFormData.hasAddons
          ? itemFormData.addons.map((a) => ({
              name: a.name.trim(),
              price: parseFloat(a.price) || 0,
            }))
          : [],
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

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGlobalVariantsModalOpen(true)}
            leftIcon={<Ruler size={14} className="text-purple-600" />}
            className="border-purple-200 text-purple-700 bg-purple-50/50 hover:bg-purple-100/60 font-bold"
          >
            📏 Global Variants Library ({globalVariants.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGlobalModalOpen(true)}
            leftIcon={<Settings size={14} className="text-indigo-600" />}
            className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60 font-bold"
          >
            ⚙️ Global Add-ons Library ({globalAddons.length})
          </Button>
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
                        {item.hasAddons && item.addons?.length > 0 && (
                          <Badge variant="outline" size="sm" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-bold">
                            + {item.addons.length} Add-ons
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.description || "No description provided"}
                      </p>
                      <p className="text-xs font-extrabold text-indigo-600 font-heading">
                        {item.hasVariants && item.variants?.length ? (
                          <span>
                            {currencySymbol}
                            {Math.min(...item.variants.map((v: any) => v.price)).toFixed(2)} – {currencySymbol}
                            {Math.max(...item.variants.map((v: any) => v.price)).toFixed(2)}
                            <span className="ml-1 text-[10px] text-slate-500 font-normal">({item.variants.length} types)</span>
                          </span>
                        ) : (
                          <span>
                            {currencySymbol}
                            {item.price ? item.price.toFixed(2) : "0.00"}
                          </span>
                        )}
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

          <div className="space-y-4">
            <Input
              label="Item Name *"
              placeholder="e.g. Tandoori Paneer Tikka"
              value={itemFormData.name}
              onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
              required
            />

            {/* Price Variation Toggle & CRUD Container */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.hasVariants}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItemFormData((prev) => ({
                          ...prev,
                          hasVariants: checked,
                          variants:
                            checked && prev.variants.length === 0
                              ? [
                                  { name: "Half", price: "" },
                                  { name: "Full", price: "" },
                                ]
                              : prev.variants,
                        }));
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Price Variation (Multiple Sizes / Types)?</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enable if this item has multiple sizes/types (e.g., Small, Medium, Large or Half, Full)
                  </p>
                </div>
                {itemFormData.hasVariants && (
                  <Badge variant="accent" size="sm">
                    Variations Active
                  </Badge>
                )}
              </div>

              {!itemFormData.hasVariants ? (
                <Input
                  label={`Price (${currencySymbol}) *`}
                  type="number"
                  step="0.01"
                  placeholder="299.00"
                  value={itemFormData.price}
                  onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                  required={!itemFormData.hasVariants}
                />
              ) : (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  {/* Global Variant Templates Quick Import Chip Grid */}
                  {globalVariants.length > 0 && (
                    <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-purple-600" />
                        Import from Global Variant Templates (1-Tap Select):
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {globalVariants.map((template, tIdx) => (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => handleImportVariantTemplateToItem(template.variants)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-purple-800 border border-purple-200 hover:bg-purple-100 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <span>⚡</span>
                            <span>{template.templateName}</span>
                            <span className="font-normal opacity-75">
                              ({template.variants.map((v) => v.name).join("/")})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Item Size Options & Prices *
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setItemFormData((prev) => ({
                            ...prev,
                            variants: [
                              { name: "Half", price: "" },
                              { name: "Full", price: "" },
                            ],
                          }))
                        }
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                      >
                        + Preset (Half/Full)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setItemFormData((prev) => ({
                            ...prev,
                            variants: [
                              { name: "Small", price: "" },
                              { name: "Medium", price: "" },
                              { name: "Large", price: "" },
                            ],
                          }))
                        }
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                      >
                        + Preset (S/M/L)
                      </button>
                    </div>
                  </div>

                  {itemFormData.variants.length === 0 ? (
                    <p className="text-xs text-rose-500 italic">
                      No variants added yet. Click "+ Add Variant" below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {itemFormData.variants.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Variant Name (e.g. Medium, Half)"
                            value={v.name}
                            onChange={(e) => handleUpdateVariantRow(idx, "name", e.target.value)}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="relative w-36">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={v.price}
                              onChange={(e) => handleUpdateVariantRow(idx, "price", e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddVariantRow("", "")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Custom Variant
                    </button>

                    {itemFormData.variants.length > 0 && itemFormData.categoryId && (
                      <button
                        type="button"
                        onClick={() => handleApplyVariantsToCategory()}
                        disabled={isApplyingVariantsToCategory}
                        className="text-[11px] font-extrabold text-purple-700 hover:text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <FolderCheck size={13} />
                        {isApplyingVariantsToCategory ? "Applying..." : "Apply Variants to ALL Items in Category"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add-ons / Smart Modifiers Toggle & CRUD Container */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.hasAddons}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setItemFormData((prev) => ({
                          ...prev,
                          hasAddons: checked,
                          addons:
                            checked && prev.addons.length === 0
                              ? [
                                  { name: "Extra Cheese", price: "30" },
                                  { name: "Garlic Dip", price: "15" },
                                ]
                              : prev.addons,
                        }));
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Add-ons / Extras (e.g. Extra Cheese, Dips, Toppings)?</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enable if customers can select optional extra add-ons for this dish
                  </p>
                </div>
                {itemFormData.hasAddons && (
                  <Badge variant="accent" size="sm">
                    Add-ons Active
                  </Badge>
                )}
              </div>

              {itemFormData.hasAddons && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  {/* Global Library Quick Import Chip Grid */}
                  {globalAddons.length > 0 && (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-indigo-600" />
                          Import from Global Master Library (1-Tap Select):
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllGlobalAddons}
                          className="text-[10px] font-extrabold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2 py-0.5 rounded-md shadow-2xs cursor-pointer"
                        >
                          ⚡ Import All ({globalAddons.length})
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {globalAddons.map((g, gIdx) => {
                          const isSelected = itemFormData.addons.some(
                            (a) => a.name.toLowerCase() === g.name.toLowerCase()
                          );
                          return (
                            <button
                              key={gIdx}
                              type="button"
                              onClick={() => handleToggleGlobalAddonToItem(g.name, g.price)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <span>{isSelected ? "✓" : "+"}</span>
                              <span>{g.name}</span>
                              <span className="font-extrabold opacity-90">({currencySymbol}{g.price})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Item Add-on Options & Prices *
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setItemFormData((prev) => ({
                            ...prev,
                            addons: [
                              { name: "Extra Cheese", price: "30" },
                              { name: "Garlic Dip", price: "15" },
                            ],
                          }))
                        }
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                      >
                        + Preset (Cheese & Dip)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setItemFormData((prev) => ({
                            ...prev,
                            addons: [
                              { name: "Extra Toppings", price: "40" },
                              { name: "Extra Sauce", price: "20" },
                            ],
                          }))
                        }
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                      >
                        + Preset (Toppings & Sauce)
                      </button>
                    </div>
                  </div>

                  {itemFormData.addons.length === 0 ? (
                    <p className="text-xs text-rose-500 italic">
                      No add-ons added yet. Click "+ Add Custom Add-on" below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {itemFormData.addons.map((a, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add-on Name (e.g. Extra Cheese)"
                            value={a.name}
                            onChange={(e) => handleUpdateAddonRow(idx, "name", e.target.value)}
                            className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="relative w-36">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={a.price}
                              onChange={(e) => handleUpdateAddonRow(idx, "price", e.target.value)}
                              className="w-full rounded-xl border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddonRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove add-on"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddAddonRow("", "")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Custom Add-on
                    </button>

                    {itemFormData.addons.length > 0 && itemFormData.categoryId && (
                      <button
                        type="button"
                        onClick={() => handleApplyAddonsToCategory()}
                        disabled={isApplyingToCategory}
                        className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <FolderCheck size={13} />
                        {isApplyingToCategory ? "Applying..." : "Apply to ALL Items in Category"}
                      </button>
                    )}
                  </div>
                </div>
              )}
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

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL ADD-ONS MASTER LIBRARY MODAL
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        title="⚙️ Global Add-ons Master Library"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-normal">
          <p className="text-xs text-slate-500">
            Create global add-ons once (e.g. Extra Cheese, Garlic Dip, Peri Peri Dip, Toppings). You can 1-tap import them into any menu item or apply them to entire categories at once.
          </p>

          {globalAddonMessage && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-900">
              {globalAddonMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider">
              Master Add-ons List ({globalAddons.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setGlobalAddons((prev) => [
                    ...prev,
                    { name: "Extra Cheese", price: "30", groupName: "Toppings" },
                    { name: "Garlic Dip", price: "15", groupName: "Dips" },
                    { name: "Peri Peri Dip", price: "20", groupName: "Dips" },
                  ])
                }
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
              >
                + Preset (Dips & Cheese)
              </button>
              <button
                type="button"
                onClick={() =>
                  setGlobalAddons((prev) => [
                    ...prev,
                    { name: "Extra Toppings", price: "40", groupName: "Toppings" },
                    { name: "Extra Sauce", price: "20", groupName: "Sauces" },
                    { name: "Soft Drink (300ml)", price: "50", groupName: "Beverages" },
                  ])
                }
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
              >
                + Preset (Toppings & Drinks)
              </button>
            </div>
          </div>

          {globalAddons.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-700 text-xs">No Global Add-ons in Master Library</p>
              <p className="text-[11px]">Click "+ Add Master Option" or use a Preset above to populate your library.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {globalAddons.map((g, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Add-on Name (e.g. Extra Cheese)"
                    value={g.name}
                    onChange={(e) => handleUpdateGlobalAddonRow(idx, "name", e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={g.price}
                      onChange={(e) => handleUpdateGlobalAddonRow(idx, "price", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white pl-6 pr-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGlobalAddonRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item from Master Library"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Direct Category Bulk Apply Bar */}
          {globalAddons.length > 0 && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 space-y-2">
              <span className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5">
                <FolderCheck size={14} className="text-indigo-600" />
                Apply ALL Master Add-ons to Category:
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={globalAddonBulkCatId}
                  onChange={(e) => setGlobalAddonBulkCatId(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="">Select Target Category...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!globalAddonBulkCatId || isApplyingToCategory}
                  onClick={() =>
                    handleApplyAddonsToCategory(
                      globalAddonBulkCatId,
                      globalAddons.map((g) => ({ name: g.name, price: g.price }))
                    )
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  {isApplyingToCategory ? "Applying..." : "🚀 Apply to Category"}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleAddGlobalAddonRow("", "", "General")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus size={14} /> Add Master Option
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsGlobalModalOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleSaveGlobalAddons}
                isLoading={isSavingGlobalAddons}
              >
                Save Master Library
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL VARIANTS MASTER LIBRARY MODAL
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isGlobalVariantsModalOpen}
        onClose={() => setIsGlobalVariantsModalOpen(false)}
        title="📏 Global Price Variation Master Library"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-normal">
          <p className="text-xs text-slate-500">
            Create reusable variant templates (e.g. Portion Sizes, Pizza Sizes, Drink Volumes). You can 1-tap import them into any dish or apply them to entire categories at once.
          </p>

          {globalVariantMessage && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-900">
              {globalVariantMessage}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider">
              Variant Templates ({globalVariants.length})
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleAddGlobalVariantTemplate("Portion Sizes (Half/Full)", [
                    { name: "Half", price: "150" },
                    { name: "Full", price: "280" },
                  ])
                }
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded"
              >
                + Preset (Half/Full)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddGlobalVariantTemplate("Pizza Sizes (S/M/L)", [
                    { name: "Small (8\")", price: "199" },
                    { name: "Medium (10\")", price: "349" },
                    { name: "Large (12\")", price: "499" },
                  ])
                }
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded"
              >
                + Preset (S/M/L)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddGlobalVariantTemplate("Beverages (250ml/500ml/1L)", [
                    { name: "250ml Glass", price: "40" },
                    { name: "500ml Bottle", price: "70" },
                    { name: "1 Litre Jug", price: "130" },
                  ])
                }
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded"
              >
                + Preset (Drinks)
              </button>
            </div>
          </div>

          {globalVariants.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-700 text-xs">No Global Variant Templates</p>
              <p className="text-[11px]">Click "+ Add Template" or use a Preset above to populate your library.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {globalVariants.map((template, tIdx) => (
                <div key={tIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Template Name (e.g. Portion Sizes)"
                      value={template.templateName}
                      onChange={(e) => handleUpdateGlobalVariantTemplateName(tIdx, e.target.value)}
                      className="font-bold text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGlobalVariantTemplate(tIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove template"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="space-y-1.5 pl-2 border-l-2 border-purple-300">
                    {template.variants.map((v, vIdx) => (
                      <div key={vIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Option (e.g. Half)"
                          value={v.name}
                          onChange={(e) => handleUpdateVariantInTemplate(tIdx, vIdx, "name", e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={v.price}
                            onChange={(e) => handleUpdateVariantInTemplate(tIdx, vIdx, "price", e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white pl-5 pr-1 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantFromTemplate(tIdx, vIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddVariantToTemplate(tIdx, "", "")}
                        className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 pt-0.5"
                      >
                        <Plus size={12} /> Add Size Option
                      </button>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={globalVariantBulkCatMap[tIdx] || ""}
                          onChange={(e) =>
                            setGlobalVariantBulkCatMap((prev) => ({ ...prev, [tIdx]: e.target.value }))
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 focus:outline-none font-medium"
                        >
                          <option value="">Select Target Category...</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!globalVariantBulkCatMap[tIdx] || isApplyingVariantsToCategory}
                          onClick={() =>
                            handleApplyVariantsToCategory(
                              globalVariantBulkCatMap[tIdx],
                              template.variants
                            )
                          }
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
                        >
                          🚀 Apply to Category
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleAddGlobalVariantTemplate()}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              <Plus size={14} /> Add Variant Template
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsGlobalVariantsModalOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleSaveGlobalVariants}
                isLoading={isSavingGlobalVariants}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Master Templates
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
