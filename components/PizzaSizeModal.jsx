"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Check, Sparkles, UtensilsCrossed } from "lucide-react";

const DEFAULT_SIZES = [
  { size: "Small", code: "S", label: "Small", slices: "4 Slices (6-inch)", defaultPriceRatio: 1 },
  { size: "Medium", code: "M", label: "Medium", slices: "6 Slices (9-inch)", defaultPriceRatio: 1.8 },
  { size: "Large", code: "L", label: "Large", slices: "8 Slices (12-inch)", defaultPriceRatio: 2.8 },
  { size: "Family", code: "F", label: "Family", slices: "12 Slices (14-inch)", defaultPriceRatio: 3.6 },
];

export default function PizzaSizeModal({ product, isOpen, onClose, onAddToCart, currency = "Rs." }) {
  const [selectedSizeCode, setSelectedSizeCode] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState("");

  // Build the 4 available variants for this pizza
  const variants = React.useMemo(() => {
    if (!product) return [];

    // If product has explicit variants array
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return DEFAULT_SIZES.map((def) => {
        const found = product.variants.find(
          (v) => v.code === def.code || v.size?.toLowerCase() === def.size.toLowerCase()
        );
        return {
          ...def,
          price: found?.price !== undefined && found?.price !== null && found?.price > 0
            ? Number(found.price)
            : Math.round(Number(product.price || 450) * def.defaultPriceRatio),
        };
      });
    }

    // Default fallback based on product base price
    const basePrice = Number(product.price) || 450;
    return DEFAULT_SIZES.map((def) => ({
      ...def,
      price: Math.round(basePrice * def.defaultPriceRatio),
    }));
  }, [product]);

  useEffect(() => {
    if (isOpen && product) {
      // Default to Medium or Large
      setSelectedSizeCode("M");
      setQuantity(1);
      setCustomNote(product.defaultNotes || "");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentVariant = variants.find((v) => v.code === selectedSizeCode) || variants[0];
  const totalPrice = (currentVariant?.price || 0) * quantity;

  const handleConfirm = () => {
    if (currentVariant) {
      onAddToCart(product, customNote, currentVariant, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/60 via-white to-orange-50/40">
          <div className="flex items-center gap-3">
            <img
              src={product.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"}
              alt={product.name}
              className="w-12 h-12 rounded-2xl object-cover border border-orange-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#1c1d22]">
                  {product.name}
                </h3>
                <span className="px-2 py-0.5 bg-orange-100 text-[#f26522] text-[10px] font-bold rounded-full uppercase">
                  Select Size
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {product.description || "Choose your preferred crust & pizza size"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Size Cards (S, M, L, F) */}
          <div>
            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block mb-2.5">
              1. Choose Pizza Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              {variants.map((v) => {
                const isSelected = selectedSizeCode === v.code;
                return (
                  <div
                    key={v.code}
                    onClick={() => setSelectedSizeCode(v.code)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "border-[#f26522] bg-[#fff2eb]/60 shadow-sm scale-101"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Top Row: Code Badge & Selected Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                          isSelected
                            ? "bg-[#f26522] text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {v.code}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#f26522] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Size Title & Description */}
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">
                        {v.label}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {v.slices}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-2 text-sm font-black text-[#f26522]">
                      {currency} {v.price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Instructions / Notes */}
          <div>
            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block mb-1.5">
              2. Custom Instructions / Notes
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Stuffed Crust Cheese, Less Spicy, Extra Sauces"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
            />
            {/* Quick Note Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["Stuffed Crust", "Extra Cheese", "Less Spicy", "Spicy", "Thin Crust"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => {
                    setCustomNote((prev) => (prev ? `${prev}, ${tag}` : tag));
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-[#f26522] text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-300 flex items-center justify-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold text-gray-900 min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#f26522] hover:border-[#f26522] flex items-center justify-center font-bold cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Confirm */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl text-xs font-bold cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-[2] py-3 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-xs font-extrabold shadow-lg active-pill-shadow cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>Add to Order ({currentVariant?.label})</span>
            <span>•</span>
            <span>{currency} {totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
