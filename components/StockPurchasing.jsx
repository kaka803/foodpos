"use client";

import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Receipt,
  FileText,
  CreditCard,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Layers,
  ArrowUpDown,
  Building2,
  Phone,
  Hash,
  ChevronDown,
  Loader2,
  RotateCcw
} from "lucide-react";
import ConfirmDialog from "./ui/ConfirmDialog";

const COMMON_CATEGORIES = [
  "Meat & Poultry",
  "Dairy & Cheese",
  "Bakery & Buns",
  "Oil & Grocery",
  "Sauces & Spices",
  "Packaging & Disposables",
  "Beverages & Drinks",
  "Vegetables & Fresh",
  "Other"
];

const COMMON_UNITS = ["kg", "ltr", "pcs", "pack", "crate", "box", "bag", "gm", "can", "dozen"];

export default function StockPurchasing() {
  const {
    purchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    settings,
    isSyncing,
    isPurchasesLoading,
    refreshPurchases,
  } = usePOS();

  const currency = settings?.currency || "Rs.";

  // Local Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'paid' | 'partial' | 'unpaid'
  const [dateFilter, setDateFilter] = useState("all"); // 'all' | 'today' | 'this_week' | 'this_month'
  const [sortBy, setSortBy] = useState("date_desc");

  // Dialog & Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [activePurchase, setActivePurchase] = useState(null); // For viewing detail slip
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    id: null,
    invoiceNumber: "",
    supplierName: "",
    supplierPhone: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    items: [
      { itemName: "", category: "Meat & Poultry", quantity: 1, unit: "kg", unitCost: 0, totalCost: 0 }
    ],
    discountAmount: 0,
    paidAmount: 0,
    paymentMethod: "Cash",
    notes: ""
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);
    const totalPaid = purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalBalanceDue = purchases.reduce((sum, p) => sum + (p.balanceDue || 0), 0);
    const totalBills = purchases.length;
    const uniqueSuppliers = new Set(purchases.map((p) => p.supplierName?.toLowerCase().trim())).size;

    return {
      totalPurchasesAmount,
      totalPaid,
      totalBalanceDue,
      totalBills,
      uniqueSuppliers,
    };
  }, [purchases]);

  // Filtered & Sorted Purchases
  const filteredPurchases = useMemo(() => {
    return purchases
      .filter((purchase) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSupplier = purchase.supplierName?.toLowerCase().includes(q);
          const matchInvoice = purchase.invoiceNumber?.toLowerCase().includes(q);
          const matchItems = purchase.items?.some((item) =>
            item.itemName?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)
          );
          if (!matchSupplier && !matchInvoice && !matchItems) return false;
        }

        // Status filter
        if (statusFilter !== "all" && purchase.paymentStatus !== statusFilter) {
          return false;
        }

        // Date filter
        if (dateFilter !== "all" && purchase.purchaseDate) {
          const pDate = new Date(purchase.purchaseDate);
          const now = new Date();
          if (dateFilter === "today") {
            if (pDate.toDateString() !== now.toDateString()) return false;
          } else if (dateFilter === "this_week") {
            const diffTime = Math.abs(now - pDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 7) return false;
          } else if (dateFilter === "this_month") {
            if (pDate.getMonth() !== now.getMonth() || pDate.getFullYear() !== now.getFullYear()) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date_desc") {
          return new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt);
        }
        if (sortBy === "date_asc") {
          return new Date(a.purchaseDate || a.createdAt) - new Date(b.purchaseDate || b.createdAt);
        }
        if (sortBy === "amount_desc") {
          return (b.grandTotal || 0) - (a.grandTotal || 0);
        }
        if (sortBy === "amount_asc") {
          return (a.grandTotal || 0) - (b.grandTotal || 0);
        }
        return 0;
      });
  }, [purchases, searchQuery, statusFilter, dateFilter, sortBy]);

  // Form Calculations
  const calculatedSubtotal = useMemo(() => {
    return formData.items.reduce((sum, it) => {
      const q = parseFloat(it.quantity) || 0;
      const c = parseFloat(it.unitCost) || 0;
      return sum + q * c;
    }, 0);
  }, [formData.items]);

  const calculatedGrandTotal = Math.max(
    0,
    calculatedSubtotal - (parseFloat(formData.discountAmount) || 0)
  );

  const calculatedBalance = Math.max(
    0,
    calculatedGrandTotal - (parseFloat(formData.paidAmount) || 0)
  );

  // Form Helpers
  const handleOpenCreateModal = () => {
    const randomInv = `PUR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      id: null,
      invoiceNumber: randomInv,
      supplierName: "",
      supplierPhone: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      items: [
        { itemName: "", category: "Meat & Poultry", quantity: 1, unit: "kg", unitCost: 0, totalCost: 0 }
      ],
      discountAmount: 0,
      paidAmount: 0,
      paymentMethod: "Cash",
      notes: ""
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (purchase) => {
    setFormData({
      id: purchase.id,
      invoiceNumber: purchase.invoiceNumber || "",
      supplierName: purchase.supplierName || "",
      supplierPhone: purchase.supplierPhone || "",
      purchaseDate: purchase.purchaseDate
        ? new Date(purchase.purchaseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      items: purchase.items && purchase.items.length > 0
        ? purchase.items.map((it) => ({
            itemName: it.itemName,
            category: it.category || "Meat & Poultry",
            quantity: it.quantity,
            unit: it.unit || "kg",
            unitCost: it.unitCost,
            totalCost: it.totalCost || it.quantity * it.unitCost,
          }))
        : [{ itemName: "", category: "Meat & Poultry", quantity: 1, unit: "kg", unitCost: 0, totalCost: 0 }],
      discountAmount: purchase.discountAmount || 0,
      paidAmount: purchase.paidAmount || 0,
      paymentMethod: purchase.paymentMethod || "Cash",
      notes: purchase.notes || ""
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === "quantity" || field === "unitCost") {
        const q = parseFloat(field === "quantity" ? value : newItems[index].quantity) || 0;
        const c = parseFloat(field === "unitCost" ? value : newItems[index].unitCost) || 0;
        newItems[index].totalCost = parseFloat((q * c).toFixed(2));
      }

      return { ...prev, items: newItems };
    });
  };

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemName: "", category: "Meat & Poultry", quantity: 1, unit: "kg", unitCost: 0, totalCost: 0 }
      ]
    }));
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();

    if (!formData.supplierName.trim()) {
      alert("Please enter a supplier or vendor name");
      return;
    }

    const validItems = formData.items.filter(
      (it) => it.itemName.trim() && parseFloat(it.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one stock item with a valid name and quantity");
      return;
    }

    const payload = {
      invoiceNumber: formData.invoiceNumber.trim(),
      supplierName: formData.supplierName.trim(),
      supplierPhone: formData.supplierPhone.trim(),
      purchaseDate: formData.purchaseDate,
      items: validItems,
      discountAmount: parseFloat(formData.discountAmount) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim(),
    };

    if (modalMode === "create") {
      const created = await addPurchase(payload);
      if (created) setIsModalOpen(false);
    } else {
      const updated = await updatePurchase(formData.id, payload);
      if (updated) setIsModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      await deletePurchase(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f4f6fa] pb-12 overflow-y-auto">
      {/* Top App Bar */}
      <header className="bg-white border-b border-[#edf0f7] px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f26522] to-[#ff8c52] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1c1d22] flex items-center gap-2">
                Stock Purchasing & Expenses
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f26522] font-semibold border border-orange-200">
                  اسٹاک خریداری
                </span>
              </h1>
              <p className="text-xs text-[#8c91a4] font-medium mt-0.5">
                Manage vendor bills, raw materials, wholesale stock purchases, and supplier balances
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshPurchases()}
            disabled={isPurchasesLoading}
            className="flex items-center gap-2 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh purchases from database"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#f26522] ${isPurchasesLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-[#f26522] hover:bg-[#d95314] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Stock Purchase</span>
          </button>
        </div>
      </header>

      <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-[#edf0f7] shadow-xs flex items-center justify-between hover:border-orange-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#8c91a4] uppercase tracking-wider">
                Total Purchasing Cost
              </p>
              <h3 className="text-2xl font-black text-[#1c1d22] mt-1">
                {currency} {stats.totalPurchasesAmount.toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">All time stock investments</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f26522] flex items-center justify-center border border-orange-100">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#edf0f7] shadow-xs flex items-center justify-between hover:border-emerald-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#8c91a4] uppercase tracking-wider">
                Paid to Suppliers
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {currency} {stats.totalPaid.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600/80 mt-1">Cleared invoices</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#edf0f7] shadow-xs flex items-center justify-between hover:border-rose-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#8c91a4] uppercase tracking-wider">
                Pending / Balance Due
              </p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {currency} {stats.totalBalanceDue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-rose-600/80 mt-1">Payables to vendors</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#edf0f7] shadow-xs flex items-center justify-between hover:border-blue-200 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#8c91a4] uppercase tracking-wider">
                Total Purchase Bills
              </p>
              <h3 className="text-2xl font-black text-[#1c1d22] mt-1">
                {stats.totalBills} <span className="text-sm font-semibold text-gray-500">Bills</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">{stats.uniqueSuppliers} distinct suppliers</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-4 border border-[#edf0f7] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#8c91a4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search supplier, bill #, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-2xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white transition-all text-[#1c1d22]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Payment status filter pills */}
            <div className="flex bg-[#f7f8fb] p-1 rounded-2xl border border-[#edf0f7]">
              {[
                { id: "all", label: "All Bills" },
                { id: "paid", label: "Paid" },
                { id: "partial", label: "Partial" },
                { id: "unpaid", label: "Unpaid" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === pill.id
                      ? "bg-white text-[#f26522] shadow-xs"
                      : "text-[#8c91a4] hover:text-[#1c1d22]"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Date filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="appearance-none bg-[#f7f8fb] border border-[#edf0f7] text-xs font-semibold text-[#1c1d22] pl-3.5 pr-8 py-2.5 rounded-2xl focus:outline-none focus:border-[#f26522] cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8c91a4] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#f7f8fb] border border-[#edf0f7] text-xs font-semibold text-[#1c1d22] pl-3.5 pr-8 py-2.5 rounded-2xl focus:outline-none focus:border-[#f26522] cursor-pointer"
              >
                <option value="date_desc">Latest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Highest Amount</option>
                <option value="amount_asc">Lowest Amount</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8c91a4] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Purchases Table / List */}
        <div className="bg-white rounded-3xl border border-[#edf0f7] shadow-xs overflow-hidden">
          {isPurchasesLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#f26522] animate-spin mb-3" />
              <h3 className="text-base font-bold text-[#1c1d22]">Loading Stock Purchases...</h3>
              <p className="text-xs text-[#8c91a4] max-w-sm mt-1">
                Fetching purchase bills and raw material entries from database
              </p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#f26522] flex items-center justify-center mb-4 border border-orange-100">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1c1d22]">No Stock Purchases Found</h3>
              <p className="text-sm text-[#8c91a4] max-w-sm mt-1 mb-6">
                {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try changing your search terms or filters to see purchase entries."
                  : "You haven't recorded any stock purchases yet. Add your first vendor bill to start tracking raw material costs."}
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 bg-[#f26522] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-orange-500/20 hover:bg-[#d95314] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record First Stock Purchase
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#edf0f7] bg-[#f9fafc] text-[11px] font-bold text-[#8c91a4] uppercase tracking-wider">
                    <th className="py-4 px-6">Invoice # & Date</th>
                    <th className="py-4 px-6">Supplier</th>
                    <th className="py-4 px-6">Stock Items</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6 text-right">Grand Total</th>
                    <th className="py-4 px-6 text-right">Balance Due</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f7] text-sm">
                  {filteredPurchases.map((purchase) => {
                    const formattedDate = purchase.purchaseDate
                      ? new Date(purchase.purchaseDate).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-";

                    return (
                      <tr
                        key={purchase.id}
                        className="hover:bg-[#fcfdfd] transition-colors group"
                      >
                        {/* Invoice & Date */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#1c1d22]">
                            {purchase.invoiceNumber || "N/A"}
                          </div>
                          <div className="text-xs text-[#8c91a4] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#1c1d22] flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            {purchase.supplierName}
                          </div>
                          {purchase.supplierPhone && (
                            <div className="text-xs text-[#8c91a4] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {purchase.supplierPhone}
                            </div>
                          )}
                        </td>

                        {/* Items Purchased */}
                        <td className="py-4 px-6 max-w-xs">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {purchase.items && purchase.items.slice(0, 2).map((it, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#f0f2f7] text-[#4a4f60] px-2 py-0.5 rounded-lg"
                              >
                                <span>{it.itemName}</span>
                                <span className="text-[#8c91a4] font-bold">
                                  ({it.quantity} {it.unit})
                                </span>
                              </span>
                            ))}
                            {purchase.items && purchase.items.length > 2 && (
                              <span className="text-[11px] font-bold text-[#8c91a4] bg-gray-100 px-1.5 py-0.5 rounded-md">
                                +{purchase.items.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment Status & Method */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                purchase.paymentStatus === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : purchase.paymentStatus === "partial"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {purchase.paymentStatus === "paid" && <CheckCircle2 className="w-3 h-3" />}
                              {purchase.paymentStatus === "partial" && <Clock className="w-3 h-3" />}
                              {purchase.paymentStatus === "unpaid" && <AlertCircle className="w-3 h-3" />}
                              {purchase.paymentStatus?.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8c91a4] font-medium mt-1">
                            via {purchase.paymentMethod || "Cash"}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-6 text-right">
                          <div className="font-extrabold text-[#1c1d22]">
                            {currency} {(purchase.grandTotal || 0).toLocaleString()}
                          </div>
                          {purchase.discountAmount > 0 && (
                            <div className="text-[11px] text-emerald-600">
                              -{currency} {purchase.discountAmount} off
                            </div>
                          )}
                        </td>

                        {/* Balance Due */}
                        <td className="py-4 px-6 text-right">
                          <div
                            className={`font-bold ${
                              (purchase.balanceDue || 0) > 0 ? "text-rose-600" : "text-gray-400"
                            }`}
                          >
                            {currency} {(purchase.balanceDue || 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Paid: {currency} {(purchase.paidAmount || 0).toLocaleString()}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setActivePurchase(purchase)}
                              className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                              title="View Slip / Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(purchase)}
                              className="p-2 rounded-xl text-gray-500 hover:text-[#f26522] hover:bg-orange-50 transition-colors cursor-pointer"
                              title="Edit Purchase"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(purchase.id)}
                              className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Purchase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT PURCHASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#edf0f7]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#edf0f7] flex items-center justify-between bg-gradient-to-r from-[#fafbfc] to-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f26522] flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1c1d22]">
                    {modalMode === "create" ? "Record New Stock Purchase" : "Edit Stock Purchase"}
                  </h2>
                  <p className="text-xs text-[#8c91a4]">
                    Add vendor invoice details and raw material items bought
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmitPurchase} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Supplier & Bill Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                    Supplier / Vendor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Metro Wholesale, Al-Madina Poultry"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white transition-all text-[#1c1d22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                    Supplier Phone / Contact
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0300 1234567"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white transition-all text-[#1c1d22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                    Invoice / Bill #
                  </label>
                  <input
                    type="text"
                    placeholder="BILL-001"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white transition-all text-[#1c1d22]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white transition-all text-[#1c1d22]"
                  />
                </div>
              </div>

              {/* Items Table Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1c1d22] flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#f26522]" />
                    Purchased Raw Materials / Items
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#f26522] hover:text-[#d95314] flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item Row
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-[#f9fafc] rounded-2xl border border-[#edf0f7] grid grid-cols-12 gap-2.5 items-center"
                    >
                      {/* Item Name */}
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Item / Material Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chicken Boneless, Oil, Cheese"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] text-[#1c1d22]"
                        />
                      </div>

                      {/* Category */}
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(index, "category", e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] text-[#1c1d22] cursor-pointer"
                        >
                          {COMMON_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Qty & Unit */}
                      <div className="col-span-6 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Qty & Unit
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            className="w-16 px-2 py-2 bg-white border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] text-[#1c1d22] text-center"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                            className="flex-1 px-1.5 py-2 bg-white border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] text-[#1c1d22] cursor-pointer"
                          >
                            {COMMON_UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-5 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          Unit Cost ({currency})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          required
                          placeholder="Rate"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(index, "unitCost", e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] text-[#1c1d22]"
                        />
                      </div>

                      {/* Row Total & Delete */}
                      <div className="col-span-7 sm:col-span-1 flex items-center justify-between gap-1 pt-4">
                        <div className="text-right flex-1 sm:hidden">
                          <span className="text-xs font-bold text-[#1c1d22]">
                            {currency} {(item.totalCost || 0).toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={formData.items.length <= 1}
                          onClick={() => handleRemoveItemRow(index)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            formData.items.length <= 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals, Payments & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#edf0f7]">
                {/* Notes & Payment Method */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-sm focus:outline-none focus:border-[#f26522] focus:bg-white text-[#1c1d22] cursor-pointer"
                    >
                      <option value="Cash">Cash (نقد)</option>
                      <option value="Bank Transfer">Bank Transfer / Online</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Credit">Vendor Credit (ادھار)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a4f60] mb-1.5">
                      Notes / Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Delivered in batch 2, received with invoice copy"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#f7f8fb] border border-[#edf0f7] rounded-xl text-xs focus:outline-none focus:border-[#f26522] focus:bg-white text-[#1c1d22] resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-[#f9fafc] rounded-2xl p-4 border border-[#edf0f7] space-y-3">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-[#1c1d22]">
                      {currency} {calculatedSubtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span>Discount / Cut (if any):</span>
                    <div className="flex items-center gap-1 w-28">
                      <span className="text-gray-400">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-[#edf0f7] rounded-lg text-xs font-bold text-right focus:outline-none focus:border-[#f26522]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm font-extrabold text-[#1c1d22] pt-2 border-t border-[#edf0f7]">
                    <span>Grand Total:</span>
                    <span className="text-[#f26522]">
                      {currency} {calculatedGrandTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#1c1d22] pt-2 border-t border-[#edf0f7]">
                    <span>Amount Paid Now:</span>
                    <div className="flex items-center gap-1 w-32">
                      <span className="text-emerald-600 font-bold">{currency}</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-black text-right text-emerald-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-[#edf0f7]">
                    <span>Balance Due to Vendor:</span>
                    <span className={calculatedBalance > 0 ? "text-rose-600 font-black" : "text-emerald-600 font-black"}>
                      {currency} {calculatedBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Buttons */}
              <div className="pt-4 border-t border-[#edf0f7] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#edf0f7] text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-xl bg-[#f26522] hover:bg-[#d95314] text-white text-sm font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSyncing ? "Saving..." : modalMode === "create" ? "Save Purchase Bill" : "Update Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PURCHASE DETAIL / BILL SLIP MODAL */}
      {activePurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-[#edf0f7] flex flex-col">
            {/* Slip Header */}
            <div className="p-6 bg-gradient-to-b from-[#f9fafc] to-white border-b border-[#edf0f7] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f26522]">
                  Stock Purchase Voucher
                </span>
                <h3 className="text-xl font-black text-[#1c1d22]">
                  {activePurchase.invoiceNumber || "BILL"}
                </h3>
              </div>
              <button
                onClick={() => setActivePurchase(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Supplier Info Box */}
              <div className="bg-[#f7f8fb] rounded-2xl p-4 border border-[#edf0f7] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Supplier Name</span>
                  <span className="font-bold text-[#1c1d22] text-sm">{activePurchase.supplierName}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Date</span>
                  <span className="font-bold text-[#1c1d22]">
                    {new Date(activePurchase.purchaseDate).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Payment Status</span>
                  <span
                    className={`inline-block font-bold mt-0.5 capitalize ${
                      activePurchase.paymentStatus === "paid"
                        ? "text-emerald-600"
                        : activePurchase.paymentStatus === "partial"
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    ● {activePurchase.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Payment Method</span>
                  <span className="font-bold text-[#1c1d22]">{activePurchase.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-[#8c91a4] uppercase tracking-wider mb-2">
                  Items Purchased Breakdown
                </h4>
                <div className="border border-[#edf0f7] rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f9fafc] border-b border-[#edf0f7] text-[#8c91a4] font-bold">
                        <th className="py-2.5 px-3.5">Item</th>
                        <th className="py-2.5 px-3.5 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Rate</th>
                        <th className="py-2.5 px-3.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf0f7]">
                      {activePurchase.items?.map((it, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-[#1c1d22]">{it.itemName}</div>
                            <div className="text-[10px] text-gray-400">{it.category}</div>
                          </td>
                          <td className="py-2.5 px-3.5 text-center font-medium">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-medium">
                            {currency} {(it.unitCost || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-[#1c1d22]">
                            {currency} {(it.totalCost || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-[#f9fafc] rounded-2xl p-4 border border-[#edf0f7] space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-[#1c1d22]">
                    {currency} {(activePurchase.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                {activePurchase.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{currency} {activePurchase.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-[#1c1d22] pt-2 border-t border-[#edf0f7]">
                  <span>Grand Total:</span>
                  <span className="text-[#f26522]">
                    {currency} {(activePurchase.grandTotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Amount Paid:</span>
                  <span>{currency} {(activePurchase.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-[#edf0f7]">
                  <span>Balance Due:</span>
                  <span>{currency} {(activePurchase.balanceDue || 0).toLocaleString()}</span>
                </div>
              </div>

              {activePurchase.notes && (
                <div className="text-xs bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-amber-900">
                  <span className="font-bold block mb-0.5">Notes:</span>
                  {activePurchase.notes}
                </div>
              )}
            </div>

            {/* Slip Footer */}
            <div className="p-4 bg-gray-50 border-t border-[#edf0f7] flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#edf0f7] hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
              <button
                onClick={() => setActivePurchase(null)}
                className="px-5 py-2 bg-[#1c1d22] text-white hover:bg-black rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Stock Purchase Record?"
        description="Are you sure you want to delete this purchase bill? This will permanently remove the record from your database."
        confirmText="Delete Purchase"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
