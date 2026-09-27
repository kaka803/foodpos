"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Search,
  Package,
  Layers,
  Flame,
  Check,
  Percent,
  Tag,
  Gift
} from "lucide-react";
import { FOOD_IMAGE_PRESETS } from "../lib/categories";

const DEAL_PRESET_IMAGES = [
  { label: "Burger & Fries Combo", url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80" },
  { label: "Pizza & Drink Feast", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80" },
  { label: "Fried Chicken & Drinks", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80" },
  { label: "Shawarma & Roll Platter", url: "https://images.unsplash.com/photo-1662116765994-1e4200c43589?w=500&auto=format&fit=crop&q=80" },
  { label: "Mega Party Combo", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80" }
];

export default function DealBuilderModal() {
  const {
    activeModal,
    setActiveModal,
    editingItem,
    setEditingItem,
    addProduct,
    updateProduct,
    isSyncing,
    settings,
    products
  } = usePOS();

  const isEditing = activeModal === "editDeal" && editingItem;
  const isOpen = activeModal === "createDeal" || activeModal === "editDeal";

  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  // Form states
  const [dealName, setDealName] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [dealImage, setDealImage] = useState(DEAL_PRESET_IMAGES[0].url);
  const [description, setDescription] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // [{ productId, name, quantity, price, image, category }]
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Non-deal products available to be added into combo
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isDeal || p.category === "deals") return false;
      if (isEditing && p.id === editingItem?.id) return false;
      const matchCat = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
      const matchQuery =
        p.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(itemSearchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [products, isEditing, editingItem, categoryFilter, itemSearchQuery]);

  // Load existing deal on edit
  useEffect(() => {
    if (isEditing && editingItem) {
      setDealName(editingItem.name || "");
      setDealPrice(editingItem.price?.toString() || "");
      setDealImage(editingItem.image || DEAL_PRESET_IMAGES[0].url);
      setDescription(editingItem.description || "");

      if (Array.isArray(editingItem.dealItems) && editingItem.dealItems.length > 0) {
        setSelectedItems(
          editingItem.dealItems.map((item) => {
            const matchedProd = products.find((p) => p.id === item.productId);
            return {
              productId: item.productId,
              name: item.name || matchedProd?.name || "Item",
              quantity: item.quantity || 1,
              price: item.price || matchedProd?.price || 0,
              image: matchedProd?.image || "",
              category: matchedProd?.category || ""
            };
          })
        );
      } else {
        setSelectedItems([]);
      }
    } else if (isOpen) {
      setDealName("");
      setDealPrice("");
      setDealImage(DEAL_PRESET_IMAGES[0].url);
      setDescription("");
      setSelectedItems([]);
      setItemSearchQuery("");
      setCategoryFilter("all");
    }
  }, [isEditing, editingItem, isOpen, products]);

  // Calculation of original value of included items
  const originalTotalPrice = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }, [selectedItems]);

  const discountSavings = useMemo(() => {
    const priceNum = parseFloat(dealPrice) || 0;
    if (originalTotalPrice > 0 && priceNum > 0) {
      return Math.max(0, originalTotalPrice - priceNum);
    }
    return 0;
  }, [originalTotalPrice, dealPrice]);

  const discountPercentage = useMemo(() => {
    if (originalTotalPrice > 0 && discountSavings > 0) {
      return Math.round((discountSavings / originalTotalPrice) * 100);
    }
    return 0;
  }, [originalTotalPrice, discountSavings]);

  if (!isOpen) return null;

  const handleAddItem = (product) => {
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.productId === product.id);
      if (exists) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            image: product.image,
            category: product.category
          }
        ];
      }
    });
  };

  const handleUpdateItemQty = (productId, delta) => {
    setSelectedItems((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleAutoGenerateSummary = () => {
    if (selectedItems.length === 0) return;
    const summaryText = selectedItems
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(" + ");
    setDescription(summaryText);
  };

  const handleClose = () => {
    setActiveModal(null);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dealName.trim()) {
      alert("Please enter a Deal Name");
      return;
    }
    if (!dealPrice || parseFloat(dealPrice) <= 0) {
      alert("Please enter a valid Deal Price");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Please add at least 1 item to the deal combo");
      return;
    }

    const itemsSummary = selectedItems
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(" + ");

    const payload = {
      name: dealName.trim(),
      category: "deals",
      price: parseFloat(dealPrice),
      image: dealImage,
      description: description.trim() || itemsSummary,
      defaultNotes: itemsSummary,
      isDeal: true,
      dealItems: selectedItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    if (isEditing) {
      await updateProduct(editingItem.id, payload);
    } else {
      await addProduct(payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 via-white to-orange-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fff2eb] text-[#f26522] flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1d22]">
                {isEditing ? "Edit Combo Deal" : "Create Custom Deal / Combo"}
              </h2>
              <p className="text-xs text-[#8c91a4]">
                Select menu items, bundle them together, and set custom discounted price
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-all font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Deal Details & Selected Items (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Deal Name & Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={dealName}
                    onChange={(e) => setDealName(e.target.value)}
                    placeholder="e.g. Mega Family Feast Deal"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Deal Price ({currency}) *</span>
                    {originalTotalPrice > 0 && (
                      <span className="text-[11px] text-gray-400 font-normal">
                        Menu Val: {currency} {originalTotalPrice}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                    placeholder="999"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-[#f26522] focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                  />
                </div>
              </div>

              {/* Savings Highlight Badge */}
              {discountSavings > 0 && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      %
                    </span>
                    <span className="font-semibold">
                      Customer Saves: <strong className="font-extrabold">{currency} {discountSavings}</strong> ({discountPercentage}% OFF)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-200/60 rounded-lg text-[11px] font-bold">
                    Super Value
                  </span>
                </div>
              )}

              {/* Selected Combo Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-gray-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#f26522]" />
                    <span>Included Items in this Deal ({selectedItems.length})</span>
                  </label>
                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoGenerateSummary}
                      className="text-[11px] text-[#f26522] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-fill description
                    </button>
                  )}
                </div>

                {selectedItems.length === 0 ? (
                  <div className="p-6 bg-orange-50/40 rounded-2xl border border-dashed border-orange-200 text-center">
                    <p className="text-xs font-semibold text-gray-600">
                      No items added to deal yet.
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      👉 Click items from the right panel to include them in this combo deal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-gray-500">
                              {currency} {item.price} each
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Qty Controls */}
                          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.productId, -1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-extrabold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.productId, 1)}
                              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-[#f26522] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[65px]">
                            <div className="text-xs font-extrabold text-gray-800">
                              {currency} {item.price * item.quantity}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deal Image & Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Deal Cover Photo
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={dealImage}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-xs"
                  />
                  <input
                    type="text"
                    value={dealImage}
                    onChange={(e) => setDealImage(e.target.value)}
                    placeholder="Paste Image URL"
                    className="flex-1 text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#f26522]"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DEAL_PRESET_IMAGES.map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setDealImage(p.url)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        dealImage === p.url
                          ? "bg-[#fff2eb] text-[#f26522] border-[#f26522]"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Deal Details / Items Summary
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 1 Large Special Pizza + 2 Zinger Burgers + 1 Regular Fries + 1.5L Drink"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Available Items Picker from Menu (5 cols) */}
            <div className="lg:col-span-5 bg-gray-50/70 p-4 rounded-3xl border border-gray-200 flex flex-col h-[520px]">
              <div className="mb-3">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2">
                  Pick Menu Items to Add
                </h3>
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search burger, pizza, fries..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f26522]"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {availableProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    No products found to add.
                  </div>
                ) : (
                  availableProducts.map((p) => {
                    const existingInCombo = selectedItems.find((i) => i.productId === p.id);
                    const qtyInCombo = existingInCombo ? existingInCombo.quantity : 0;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleAddItem(p)}
                        className={`p-2.5 bg-white hover:bg-orange-50/50 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          qtyInCombo > 0 ? "border-[#f26522] bg-orange-50/30" : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={p.image || FOOD_IMAGE_PRESETS[0].url}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 truncate">
                              {p.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 font-semibold capitalize">
                              {p.category} • {currency} {p.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {qtyInCombo > 0 && (
                            <span className="px-2 py-0.5 bg-[#f26522] text-white text-[10px] font-bold rounded-full">
                              x{qtyInCombo}
                            </span>
                          )}
                          <button
                            type="button"
                            className="w-7 h-7 rounded-xl bg-gray-100 hover:bg-[#f26522] text-gray-600 hover:text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 shrink-0">
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
              disabled={isSyncing || selectedItems.length === 0}
              className="flex-1 py-3 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-xs font-extrabold shadow-lg active-pill-shadow cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving Deal to Database...</span>
                </>
              ) : (
                <span>{isEditing ? "Update Deal" : "Save & Publish Deal"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
