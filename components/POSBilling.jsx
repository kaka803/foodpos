"use client";

import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import { ProductCardSkeleton } from "./ui/Skeleton";
import {
  Search,
  AlertTriangle,
  Plus,
  Minus,
  Pencil,
  Trash2,
  Printer,
  PauseCircle,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  Check,
  Percent,
  Receipt,
  Layers,
  Flame,
  Loader2,
  Gift
} from "lucide-react";
import { CATEGORIES } from "../lib/categories";
import PizzaSizeModal from "./PizzaSizeModal";

export default function POSBilling() {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    currentOrderNumber,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    cartItemCount,
    subtotal,
    taxAmount,
    grandTotal,
    isLoading,
    isSyncing,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    holdCurrentOrder,
    setActiveModal,
    setEditingItem,
    updateItemNotes,
    settings,
    heldOrders,
    refreshProducts
  } = usePOS();

  // Local state for modals
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [customNoteModalItem, setCustomNoteModalItem] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [pizzaSizeModalItem, setPizzaSizeModalItem] = useState(null);

  const categories = CATEGORIES;

  // Available tables
  const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "VIP 1", "VIP 2", "Takeaway"];

  // Filtered products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.defaultNotes?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Format currency
  const formatPrice = (amount) => {
    const curr = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";
    const formattedNum = Number(amount) % 1 === 0 ? Number(amount) : Number(amount).toFixed(2);
    return `${curr} ${formattedNum}`;
  };

  const currentCategoryTitle =
    categories.find((c) => c.id === selectedCategory)?.label || "Menu";

  const handleOpenNoteEditor = (cartItem) => {
    setCustomNoteModalItem(cartItem);
    setTempNoteText(cartItem.notes || "");
  };

  const handleSaveNote = () => {
    if (customNoteModalItem) {
      updateItemNotes(customNoteModalItem.cartId, tempNoteText);
      setCustomNoteModalItem(null);
    }
  };

  // Calculate item counts for each category
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach((p) => {
      const c = p.category?.toLowerCase() || "other";
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleProductClick = (item) => {
    const isPizza = item.category === "pizza" || item.category === "special pizza" || item.hasVariants;
    if (isPizza) {
      setPizzaSizeModalItem(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden bg-[#f4f6fa]">
      {/* LEFT & CENTER: Product Grid & Categories Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Fixed Top Header: Search Bar, Category Filters & Title */}
        <div className="shrink-0 pt-5 lg:pt-6 px-6 lg:px-8 pb-3 bg-[#f4f6fa] z-10">
          {/* Top Header: Search Bar & Add Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0b4]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items or categories..."
                className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-[#edf0f7] text-sm text-[#1c1d22] placeholder-[#9aa0b4] focus:outline-none focus:ring-2 focus:ring-[#f26522]/20 focus:border-[#f26522] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => refreshProducts()}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-[#e2e6ef] text-[#1c1d22] rounded-xl text-xs font-bold shadow-2xs hover:border-[#f26522] transition-all cursor-pointer disabled:opacity-50"
                title="Refresh menu items"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-[#f26522] ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setActiveModal("createDeal");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer hover:shadow-xs"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Create Deal</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setActiveModal("addProduct");
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-[#e2e6ef] text-[#1c1d22] rounded-xl text-xs font-bold shadow-2xs hover:border-[#f26522] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#f26522]" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Compact, 100% Accessible Category Chips (Wrap Grid - No Horizontal Scroll Needed) */}
          <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-[#edf0f7] shadow-2xs mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer border ${
                      isSelected
                        ? "bg-[#fff2eb] text-[#f26522] border-[#f26522] shadow-xs scale-102"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-[#1c1d22] hover:bg-orange-50/30"
                    }`}
                  >
                    <span className="text-sm leading-none">{cat.icon}</span>
                    <span className="whitespace-nowrap">{cat.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold leading-none ${
                          isSelected
                            ? "bg-[#f26522] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Header & Quick Result Info */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#1c1d22] tracking-tight">
                {currentCategoryTitle}
              </h2>
              <span className="text-[11px] font-semibold text-[#8c91a4] bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-[11px] font-bold text-[#f26522] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Show All Items</span>
                <span>✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Products Grid Area */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-8 pt-2 pb-8 scrollbar-thin scrollbar-thumb-gray-200">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 pb-8 pt-1">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ProductCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center my-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#f26522] flex items-center justify-center text-2xl mb-3">
                🍔
              </div>
              <h3 className="text-base font-bold text-gray-800">
                {products.length === 0 ? "No food items in database yet" : "No products found"}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1 mb-4">
                {products.length === 0
                  ? "Start by adding your first fast food item to MongoDB."
                  : "Try searching with another keyword or select a different category."}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => setActiveModal("addProduct")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#f26522] hover:bg-[#e05413] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Food Item</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 pb-8 pt-1">
              {filteredProducts.map((item) => {
                const isPizza = item.category === "pizza" || item.category === "special pizza" || item.hasVariants;
                const cartItem = cart.find((c) => c.productId === item.id);
                const inCartQty = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleProductClick(item)}
                    className="group relative bg-white rounded-[24px] p-5 border border-[#edf0f7] pos-card-shadow pos-card-hover flex flex-col items-center text-center cursor-pointer transition-all"
                  >
                    {/* Deal badge indicator */}
                    {(item.isDeal || item.category === "deals") && (
                      <div className="absolute top-3.5 left-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>DEAL</span>
                      </div>
                    )}

                    {/* Pizza sizes indicator */}
                    {isPizza && !(item.isDeal || item.category === "deals") && (
                      <div className="absolute top-3.5 left-3.5 bg-orange-100 text-[#f26522] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                        <span>🍕 S • M • L • F</span>
                      </div>
                    )}

                    {/* In-cart badge indicator */}
                    {inCartQty > 0 && (
                      <div className="absolute top-3.5 right-3.5 bg-[#f26522] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                        {inCartQty}
                      </div>
                    )}

                    {/* Circular Food Image matching reference */}
                    <div className="relative w-36 h-36 mb-3 rounded-full p-1 bg-gradient-to-b from-orange-50/60 to-transparent flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"}
                        alt={item.name}
                        className="w-32 h-32 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Title */}
                    <h3 className="text-base font-bold text-[#1c1d22] group-hover:text-[#f26522] transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {/* Deal / Product sub-details or notes */}
                    {(item.defaultNotes || item.description) && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 px-2">
                        {item.defaultNotes || item.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="text-base font-extrabold text-[#f26522] mt-1.5">
                      {isPizza ? `From ${formatPrice(item.price)}` : formatPrice(item.price)}
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(item);
                      }}
                      className="mt-3 w-full py-2 bg-[#fff2eb] hover:bg-[#f26522] text-[#f26522] hover:text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
                    >
                      {isPizza ? (
                        <>
                          <span>Select Size</span>
                          <span className="text-[10px] bg-white/70 px-1 py-0.2 rounded font-extrabold text-[#f26522]">
                            S/M/L/F
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Current Order / Billing Panel matching reference */}
      <div className="w-full lg:w-[380px] xl:w-[410px] bg-white border-l border-[#edf0f7] flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm">
        {/* Order Header: Order # and Table */}
        <div className="p-6 pb-4 border-b border-[#f0f2f7]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#8c91a4]">Current Orders</span>
              <h2 className="text-xl font-extrabold text-[#1c1d22] tracking-tight">
                #{currentOrderNumber}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-[#8c91a4]">Table</span>
              <button
                onClick={() => setShowTableSelect(!showTableSelect)}
                className="text-base font-extrabold text-[#1c1d22] block hover:text-[#f26522] transition-colors cursor-pointer"
              >
                {orderType === "dine_in" ? tableNumber : "None"} ▾
              </button>
            </div>
          </div>

          {/* Table Selector Dropdown */}
          {showTableSelect && (
            <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 animate-fadeIn">
              <div className="text-xs font-bold text-gray-500 mb-2">Select Table:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {tables.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTableNumber(t);
                      setShowTableSelect(false);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      tableNumber === t
                        ? "bg-[#f26522] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dine In / Take Away / Delivery Segmented Control */}
          <div className="flex items-center gap-2 mt-4 p-1 bg-[#f4f6fa] rounded-2xl">
            <button
              onClick={() => setOrderType("dine_in")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                orderType === "dine_in"
                  ? "bg-[#f26522] text-white shadow-sm"
                  : "text-[#737787] hover:text-[#1c1d22]"
              }`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType("take_away")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                orderType === "take_away"
                  ? "bg-[#f26522] text-white shadow-sm"
                  : "text-[#737787] hover:text-[#1c1d22]"
              }`}
            >
              Take Away
            </button>
            <button
              onClick={() => setOrderType("delivery")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                orderType === "delivery"
                  ? "bg-[#f26522] text-white shadow-sm"
                  : "text-[#737787] hover:text-[#1c1d22]"
              }`}
            >
              Delivery
            </button>
          </div>
        </div>

        {/* Order Items List matching screenshot */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#8c91a4] py-12">
              <div className="w-16 h-16 rounded-full bg-[#f4f6fa] flex items-center justify-center text-2xl mb-3">
                🛒
              </div>
              <p className="text-sm font-semibold text-[#1c1d22]">No items selected yet</p>
              <p className="text-xs text-[#8c91a4] mt-1 max-w-[200px]">
                Click on any food item to add it to the active order
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-start gap-3 pb-4 border-b border-[#f4f6fa] last:border-0 group"
              >
                {/* Food Thumbnail */}
                <div className="w-12 h-12 rounded-2xl bg-[#fff2eb] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-[#1c1d22] truncate pr-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => handleOpenNoteEditor(item)}
                      className="text-[#9aa0b4] hover:text-[#f26522] transition-colors p-1 cursor-pointer"
                      title="Edit note / customization"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Notes / Customization e.g. "Note : Less Ice" or "Crust : Stuffed Crust Sosis" */}
                  {item.notes && (
                    <div className="text-[11px] text-[#8c91a4] leading-tight mt-0.5 whitespace-pre-line">
                      {item.notes}
                    </div>
                  )}

                  {/* Price & Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-extrabold text-[#1c1d22]">
                      {formatPrice(item.price * item.quantity)}
                    </span>

                    {/* Plus / Minus Counter matching screenshot */}
                    <div className="flex items-center gap-2 bg-[#f4f6fa] rounded-lg px-1.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.cartId, -1)}
                        className="w-5 h-5 rounded-md bg-white text-[#737787] hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#1c1d22] min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, 1)}
                        className="w-5 h-5 rounded-md bg-white text-[#737787] hover:text-[#f26522] hover:bg-[#fff2eb] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Bill Calculation & Print Bills Button matching screenshot */}
        <div className="p-6 pt-4 bg-white border-t border-[#f0f2f7] space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-[#8c91a4]">
              <span>Items({cartItemCount})</span>
              <span className="font-bold text-[#1c1d22]">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-[#8c91a4]">
              <span>Tax ({settings.taxRate}%)</span>
              <span className="font-bold text-[#1c1d22]">{formatPrice(taxAmount)}</span>
            </div>

            <div className="pt-2 border-t border-dashed border-[#edf0f7] flex items-center justify-between">
              <span className="text-base font-bold text-[#1c1d22]">Total</span>
              <span className="text-xl font-extrabold text-[#1c1d22]">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Hold, Clear & Print Bills */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setActiveModal("invoice")}
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-2xl text-base font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                cart.length > 0
                  ? "bg-[#f26522] hover:bg-[#e05413] text-white shadow-lg active-pill-shadow hover:scale-[1.01]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Printer className="w-5 h-5" />
              <span>Print Bills</span>
            </button>

            {/* Sub-actions */}
            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={holdCurrentOrder}
                  className="flex-1 py-2 px-3 bg-[#f4f6fa] hover:bg-gray-200 text-[#737787] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Hold order for later"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Hold Order</span>
                </button>
                <button
                  onClick={clearCart}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  title="Clear current cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Customization Modal */}
      {customNoteModalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Custom Note: {customNoteModalItem.name}
              </h3>
              <button
                onClick={() => setCustomNoteModalItem(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={3}
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="e.g. Less Ice, Extra Spicy, No Mayo, Stuffed Crust..."
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] mb-3"
            />

            {/* Quick tag suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["Less Ice", "Extra Cheese", "Extra Spicy", "No Mayo", "Thin Crust", "Extra Sauce"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setTempNoteText((prev) => (prev ? `${prev}, ${tag}` : tag))
                    }
                    className="px-2.5 py-1 bg-gray-100 hover:bg-[#fff2eb] hover:text-[#f26522] rounded-lg text-xs font-medium text-gray-600 transition-all"
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCustomNoteModalItem(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-2.5 bg-[#f26522] hover:bg-[#e05413] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pizza Size Selector Modal (S, M, L, F) */}
      <PizzaSizeModal
        isOpen={!!pizzaSizeModalItem}
        product={pizzaSizeModalItem}
        currency={settings?.currency && settings.currency !== "$" ? settings.currency : "Rs."}
        onClose={() => setPizzaSizeModalItem(null)}
        onAddToCart={(product, note, variant, qty) => {
          addToCart(product, note, variant, qty);
        }}
      />
    </div>
  );
}
