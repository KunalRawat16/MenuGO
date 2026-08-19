"use client";

import React, { useState } from "react";
import { Plus, X, Tag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface Step4Data {
  cuisineTypes: string[];
  categories: string[];
}

interface Step4Props {
  data: Step4Data;
  businessType: string;
  onChange: (field: keyof Step4Data, value: string[]) => void;
}

const CUISINE_OPTIONS = [
  "African",
  "American",
  "Asian",
  "Breakfast & Brunch",
  "Chinese",
  "Continental",
  "Indian",
  "Italian",
  "Mexican",
  "Mediterranean",
  "Hair Care",
  "Skin & Facial",
  "Spa & Massage",
  "Nail Art",
  "Bridal & Makeup",
  "Beverages & Cocktails",
];

const PRESET_CATEGORIES_BY_TYPE: Record<string, string[]> = {
  restaurant: ["Starters & Appetizers", "Main Courses", "Desserts", "Beverages"],
  cafe: ["Coffee & Teas", "Sandwiches & Wraps", "Bakery & Desserts", "Cold Drinks"],
  spa: ["Full Body Massage", "Facials & Skin Therapy", "Aromatherapy", "Express Packages"],
  salon: ["Haircut & Styling", "Coloring & Highlights", "Manicure & Pedicure", "Facials"],
  hotel: ["In-Room Dining", "Breakfast Specials", "Chef Specials", "Bar Menu"],
  other: ["Featured Services", "Main Offerings", "Special Packages"],
};

export function Step4Categories({ data, businessType, onChange }: Step4Props) {
  const [newCatInput, setNewCatInput] = useState("");

  const toggleCuisine = (option: string) => {
    if (data.cuisineTypes.includes(option)) {
      onChange(
        "cuisineTypes",
        data.cuisineTypes.filter((c) => c !== option)
      );
    } else {
      onChange("cuisineTypes", [...data.cuisineTypes, option]);
    }
  };

  const addCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !data.categories.includes(trimmed)) {
      onChange("categories", [...data.categories, trimmed]);
      setNewCatInput("");
    }
  };

  const removeCategory = (catToRemove: string) => {
    onChange(
      "categories",
      data.categories.filter((c) => c !== catToRemove)
    );
  };

  const applyPresetCategories = () => {
    const presets = PRESET_CATEGORIES_BY_TYPE[businessType] || PRESET_CATEGORIES_BY_TYPE.restaurant;
    const combined = Array.from(new Set([...data.categories, ...presets]));
    onChange("categories", combined);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Step 4: Categories & Specialties
        </h2>
        <p className="text-xs text-slate-500">
          Select tags and create initial menu categories for your offerings.
        </p>
      </div>

      {/* Specialty Checkboxes */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          Specialties & Tags (Select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CUISINE_OPTIONS.map((option) => {
            const isSelected = data.cuisineTypes.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleCuisine(option)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="truncate">{option}</span>
                {isSelected && <span className="text-indigo-600 font-bold ml-1">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Default Categories Tag Input */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
            <Tag size={14} className="text-indigo-600" /> Default Menu Categories
          </label>
          <button
            type="button"
            onClick={applyPresetCategories}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Sparkles size={13} /> Load Recommended Categories
          </button>
        </div>

        {/* Input box to add new category */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g., Main Courses or Aromatherapy"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="button" variant="secondary" onClick={addCategory} leftIcon={<Plus size={16} />}>
            Add
          </Button>
        </div>

        {/* Current Categories Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {data.categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No categories added yet. Click "Load Recommended Categories" above.</p>
          ) : (
            data.categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
