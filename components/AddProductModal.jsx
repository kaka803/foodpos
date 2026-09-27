"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "../context/POSContext";
import { X, Plus, Image as ImageIcon, Sparkles } from "lucide-react";
import { PRODUCT_CATEGORIES, FOOD_IMAGE_PRESETS } from "../lib/categories";

export default function AddProductModal() {
  const { activeModal, setActiveModal, editingItem, setEditingItem, addProduct, updateProduct, isSyncing, settings } = usePOS();

  const isEditing = activeModal === "editProduct" && editingItem;
  const isOpen = activeModal === "addProduct" || activeModal === "editProduct";

  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  const [formData, setFormData] = useState({
    name: "",
    category: "pizza",
    price: "450",
    description: "",
    defaultNotes: "",
    image: FOOD_IMAGE_PRESETS[0].url,
    hasVariants: true,
  });

  const [pizzaPrices, setPizzaPrices] = useState({
    small: "450",
    medium: "850",
    large: "1350",
    family: "1750",
  });

  const isPizzaCategory = formData.category === "pizza" || formData.category === "special pizza";

  useEffect(() => {
    if (isEditing && editingItem) {
      const cat = editingItem.category || "pizza";
      const isPizza = cat === "pizza" || cat === "special pizza";
      const hasVars = editingItem.hasVariants !== undefined ? editingItem.hasVariants : isPizza;

      setFormData({
        name: editingItem.name || "",
        category: cat,
        price: editingItem.price?.toString() || "",
        description: editingItem.description || "",
        defaultNotes: editingItem.defaultNotes || "",
        image: editingItem.image || FOOD_IMAGE_PRESETS[0].url,
        hasVariants: hasVars,
      });

      if (Array.isArray(editingItem.variants) && editingItem.variants.length > 0) {
        const s = editingItem.variants.find((v) => v.code === "S" || v.size?.toLowerCase() === "small")?.price || "";
        const m = editingItem.variants.find((v) => v.code === "M" || v.size?.toLowerCase() === "medium")?.price || "";
        const l = editingItem.variants.find((v) => v.code === "L" || v.size?.toLowerCase() === "large")?.price || "";
        const f = editingItem.variants.find((v) => v.code === "F" || v.size?.toLowerCase() === "family")?.price || "";
        setPizzaPrices({
          small: s?.toString() || "",
          medium: m?.toString() || "",
          large: l?.toString() || "",
          family: f?.toString() || "",
        });
      } else {
        setPizzaPrices({
          small: editingItem.price?.toString() || "450",
          medium: (editingItem.price ? Number(editingItem.price) * 1.8 : 850).toFixed(0),
          large: (editingItem.price ? Number(editingItem.price) * 2.8 : 1350).toFixed(0),
          family: (editingItem.price ? Number(editingItem.price) * 3.6 : 1750).toFixed(0),
        });
      }
    } else if (isOpen) {
      setFormData({
        name: "",
        category: "pizza",
        price: "450",
        description: "",
        defaultNotes: "",
        image: FOOD_IMAGE_PRESETS[0].url,
        hasVariants: true,
      });
      setPizzaPrices({
        small: "450",
        medium: "850",
        large: "1350",
        family: "1750",
      });
    }
  }, [isEditing, editingItem, isOpen, activeModal]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter product name");
      return;
    }

    let finalPrice = parseFloat(formData.price) || 0;
    let variants = [];
    const hasVariants = isPizzaCategory && formData.hasVariants;

    if (hasVariants) {
      const sPrice = parseFloat(pizzaPrices.small) || 0;
      const mPrice = parseFloat(pizzaPrices.medium) || 0;
      const lPrice = parseFloat(pizzaPrices.large) || 0;
      const fPrice = parseFloat(pizzaPrices.family) || 0;

      if (!sPrice && !mPrice && !lPrice && !fPrice) {
        alert("Please set at least one pizza size price.");
        return;
      }

      variants = [
        { size: "Small", code: "S", price: sPrice },
        { size: "Medium", code: "M", price: mPrice },
        { size: "Large", code: "L", price: lPrice },
        { size: "Family", code: "F", price: fPrice },
      ].filter((v) => v.price > 0);

      finalPrice = sPrice || mPrice || lPrice || fPrice;
    } else {
      if (!finalPrice || finalPrice <= 0) {
        alert("Please enter a valid price.");
        return;
      }
    }

    const payload = {
      ...formData,
      price: finalPrice,
      hasVariants,
      variants,
    };

    if (isEditing) {
      updateProduct(editingItem.id, payload);
    } else {
      addProduct(payload);
    }
  };

  const handleClose = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-[#1c1d22]">
              {isEditing ? "Edit Food Item" : "Add New Food Item"}
            </h2>
            <p className="text-xs text-[#8c91a4]">
              {isEditing ? "Update details & pricing" : "Add a fresh menu item to your fast food POS"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview & Preset Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Food Photo
            </label>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={formData.image}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-xs"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Paste Image URL"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#f26522]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Or pick a photo from quick presets below:
                </span>
              </div>
            </div>

            {/* Quick Preset Photo Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {FOOD_IMAGE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setFormData({ ...formData, image: p.url })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    formData.image === p.url
                      ? "bg-[#fff2eb] text-[#f26522] border-[#f26522]"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chicken Fajita Pizza"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
            />
          </div>

          {/* Category & Price Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  const isPizza = newCat === "pizza" || newCat === "special pizza";
                  setFormData({
                    ...formData,
                    category: newCat,
                    hasVariants: isPizza ? true : formData.hasVariants,
                  });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold capitalize focus:outline-none focus:border-[#f26522]"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {!isPizzaCategory && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Price ({currency}) *
                </label>
                <input
                  type="number"
                  step="1"
                  required={!isPizzaCategory}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="650"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold focus:outline-none focus:border-[#f26522]"
                />
              </div>
            )}
          </div>

          {/* 4 Pizza Sizes Pricing Section (Small, Medium, Large, Family) */}
          {isPizzaCategory && (
            <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/60 p-4 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🍕</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900">
                      Pizza Sizes & Pricing (S, M, L, F)
                    </h4>
                    <p className="text-[10px] text-gray-500">
                      Set all 4 sizes in one go. Billing par popup me size select hoga.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-orange-200/70 text-orange-900 text-[10px] font-bold rounded-lg">
                  4 Sizes Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Small */}
                <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-gray-800">Small</span>
                    <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 font-extrabold text-[10px] rounded">
                      S
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      required
                      value={pizzaPrices.small}
                      onChange={(e) => setPizzaPrices({ ...pizzaPrices, small: e.target.value })}
                      placeholder="450"
                      className="w-full text-xs font-bold p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>

                {/* Medium */}
                <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-gray-800">Medium</span>
                    <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 font-extrabold text-[10px] rounded">
                      M
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      required
                      value={pizzaPrices.medium}
                      onChange={(e) => setPizzaPrices({ ...pizzaPrices, medium: e.target.value })}
                      placeholder="850"
                      className="w-full text-xs font-bold p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>

                {/* Large */}
                <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-gray-800">Large</span>
                    <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 font-extrabold text-[10px] rounded">
                      L
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      required
                      value={pizzaPrices.large}
                      onChange={(e) => setPizzaPrices({ ...pizzaPrices, large: e.target.value })}
                      placeholder="1350"
                      className="w-full text-xs font-bold p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>

                {/* Family */}
                <div className="bg-white p-2.5 rounded-xl border border-orange-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-gray-800">Family</span>
                    <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 font-extrabold text-[10px] rounded">
                      F
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      required
                      value={pizzaPrices.family}
                      onChange={(e) => setPizzaPrices({ ...pizzaPrices, family: e.target.value })}
                      placeholder="1750"
                      className="w-full text-xs font-bold p-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#f26522]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default Custom Note */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Default Note (Crust / Flavor / Options)
            </label>
            <input
              type="text"
              value={formData.defaultNotes}
              onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
              placeholder="e.g. Stuffed Crust Cheese, Less Spicy, etc."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh Italian mozzarella, hand-stretched dough, secret pizza sauce..."
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSyncing}
              className="flex-1 py-3 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-xs font-extrabold shadow-lg active-pill-shadow cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isSyncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Add to Menu"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
