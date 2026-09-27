import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import ConfirmDialog from "./ui/ConfirmDialog";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  UtensilsCrossed,
  Layers,
  Sparkles,
  Loader2,
  Gift,
  RotateCcw
} from "lucide-react";
import { CATEGORIES } from "../lib/categories";

export default function ProductsManager() {
  const {
    products,
    deleteProduct,
    setActiveModal,
    setEditingItem,
    isLoading,
    isSyncing,
    settings,
    refreshProducts
  } = usePOS();

  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);

  const categories = CATEGORIES;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === "all" || p.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchCat && matchSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  const handleEdit = (product) => {
    setEditingItem(product);
    if (product.isDeal || product.category === "deals") {
      setActiveModal("editDeal");
    } else {
      setActiveModal("editProduct");
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1d22] tracking-tight">
            Menu & Products Management
          </h1>
          <p className="text-sm text-[#737787] mt-1">
            Add fast food items, create combo deals with custom items, and manage pricing in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => refreshProducts()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] rounded-2xl text-xs font-bold pos-card-shadow transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh menu items from database"
          >
            <RotateCcw className={`w-4 h-4 text-[#f26522] ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setActiveModal("createDeal");
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-sm font-extrabold shadow-md transition-all cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>Create Combo Deal</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setActiveModal("addProduct");
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-sm font-extrabold shadow-lg active-pill-shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#edf0f7] pos-card-shadow mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search food items..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f26522]"
          />
        </div>

        {/* Category Filter Pills (Wrap Grid - All 100% visible) */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 justify-start lg:justify-end">
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat.id;
            const count = cat.id === "all"
              ? products.length
              : products.filter((p) => p.category?.toLowerCase() === cat.id.toLowerCase()).length;

            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[#fff2eb] text-[#f26522] border-[#f26522] shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-orange-200 hover:bg-orange-50/40"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isSelected ? "bg-[#f26522] text-white" : "bg-gray-200 text-gray-600"
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

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-[#edf0f7] pos-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Product Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Total Sold</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2.5 bg-gray-100 rounded w-3/4"></div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-gray-100 rounded-lg w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-orange-100 rounded w-12"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-100 rounded w-14"></div></td>
                    <td className="py-3.5 px-6 text-right"><div className="h-7 bg-gray-100 rounded-xl w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isDealItem = p.isDeal || p.category === "deals";
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"}
                            alt={p.name}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-sm text-[#1c1d22] flex items-center gap-2">
                              <span>{p.name}</span>
                              {isDealItem && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full">
                                  ⭐ Combo Deal
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1 max-w-sm">
                              {p.defaultNotes || p.description || "No extra description"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold capitalize text-xs ${
                          isDealItem
                            ? "bg-[#fff2eb] text-[#f26522] border border-orange-200"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-black text-sm text-[#f26522]">
                        <div>
                          {p.hasVariants ? `From ${currency} ${p.price}` : `${currency} ${p.price.toFixed(0)}`}
                        </div>
                        {p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0 && (
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5 whitespace-nowrap">
                            {p.variants.map((v) => `${v.code}:${v.price}`).join(" • ")}
                          </div>
                        )}
                      </td>

                      {/* Total Sold */}
                      <td className="py-3.5 px-4 text-gray-700 font-semibold">
                        {p.salesCount || 0} units
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 bg-gray-100 hover:bg-[#fff2eb] text-gray-600 hover:text-[#f26522] rounded-xl transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-2 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Smooth Delete Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Food Item?"
        description={`Are you sure you want to delete "${productToDelete?.name}"? It will be permanently removed from your MongoDB menu.`}
        confirmText="Yes, Delete Item"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSyncing}
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
