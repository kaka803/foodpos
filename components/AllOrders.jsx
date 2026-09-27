"use client";

import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  Search,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  RotateCcw,
  FileSpreadsheet,
  ArrowUpDown,
  Tag,
  Phone,
  User,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  X,
  Loader2
} from "lucide-react";

export default function AllOrders() {
  const { orders, settings, setCompletedOrder, setActiveModal, isOrdersLoading, refreshOrders } = usePOS();
  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'dine_in' | 'take_away' | 'delivery'
  const [paymentFilter, setPaymentFilter] = useState("all"); // 'all' | 'Cash' | 'Card' | 'Online'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'amount_high' | 'amount_low'

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders
      .filter((o) => {
        const orderTime = new Date(o.timestamp || o.createdAt).getTime();

        // 1. Search Query (Order #, Customer, Phone, Cashier, Item Names)
        const q = searchTerm.toLowerCase().trim();
        if (q) {
          const matchOrderNumber = o.orderNumber?.toLowerCase().includes(q);
          const matchCustomer = o.customerName?.toLowerCase().includes(q);
          const matchPhone = o.customerPhone?.toLowerCase().includes(q);
          const matchCashier = o.cashier?.toLowerCase().includes(q);
          const matchItems = o.items?.some((item) => item.name?.toLowerCase().includes(q));

          if (!matchOrderNumber && !matchCustomer && !matchPhone && !matchCashier && !matchItems) {
            return false;
          }
        }

        // 2. Date Presets
        if (datePreset === "today") {
          if (orderTime < startOfToday) return false;
        } else if (datePreset === "yesterday") {
          if (orderTime < startOfYesterday || orderTime >= startOfToday) return false;
        } else if (datePreset === "week") {
          if (orderTime < startOfWeek) return false;
        } else if (datePreset === "month") {
          if (orderTime < startOfMonth) return false;
        } else if (datePreset === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate).setHours(0, 0, 0, 0);
            if (orderTime < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate).setHours(23, 59, 59, 999);
            if (orderTime > end) return false;
          }
        }

        // 3. Order Type Filter
        if (typeFilter !== "all" && o.orderType !== typeFilter) {
          return false;
        }

        // 4. Payment Method Filter
        if (paymentFilter !== "all") {
          const orderPay = (o.paymentMethod || "").toLowerCase();
          if (!orderPay.includes(paymentFilter.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp || a.createdAt).getTime();
        const timeB = new Date(b.timestamp || b.createdAt).getTime();
        if (sortBy === "newest") return timeB - timeA;
        if (sortBy === "oldest") return timeA - timeB;
        if (sortBy === "amount_high") return (b.total || 0) - (a.total || 0);
        if (sortBy === "amount_low") return (a.total || 0) - (b.total || 0);
        return 0;
      });
  }, [orders, searchTerm, datePreset, customStartDate, customEndDate, typeFilter, paymentFilter, sortBy]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTax = filteredOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
    const totalItems = filteredOrders.reduce((sum, o) => sum + (o.itemsCount || 0), 0);
    const avgOrder = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    return { totalRevenue, totalTax, totalItems, avgOrder };
  }, [filteredOrders]);

  const hasActiveFilters =
    searchTerm !== "" ||
    datePreset !== "all" ||
    typeFilter !== "all" ||
    paymentFilter !== "all" ||
    sortBy !== "newest" ||
    customStartDate !== "" ||
    customEndDate !== "";

  const handleResetFilters = () => {
    setSearchTerm("");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setTypeFilter("all");
    setPaymentFilter("all");
    setSortBy("newest");
  };

  const handleReprint = (order) => {
    setCompletedOrder(order);
    setActiveModal("invoice");
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      "Order Number",
      "Date",
      "Time",
      "Customer",
      "Phone",
      "Order Type",
      "Table",
      "Items Count",
      "Payment Method",
      "Subtotal",
      "Tax Amount",
      "Total",
      "Cashier"
    ];

    const rows = filteredOrders.map((o) => {
      const d = new Date(o.timestamp || o.createdAt);
      return [
        o.orderNumber,
        d.toLocaleDateString(),
        d.toLocaleTimeString(),
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
        o.orderType,
        o.tableNumber || "-",
        o.itemsCount,
        o.paymentMethod,
        (o.subtotal || 0).toFixed(2),
        (o.taxAmount || 0).toFixed(2),
        (o.total || 0).toFixed(2),
        `"${(o.cashier || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `All_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#1c1d22] tracking-tight">
              All Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff2eb] text-[#f26522] border border-[#f26522]/20">
              {filteredOrders.length} records
            </span>
          </div>
          <p className="text-sm text-[#737787] mt-1">
            Browse and filter through all order history, receipts, and payment records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshOrders()}
            disabled={isOrdersLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] hover:border-[#f26522]/30 rounded-2xl text-xs font-bold pos-card-shadow transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh orders from database"
          >
            <RotateCcw className={`w-4 h-4 text-[#f26522] ${isOrdersLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] hover:border-[#f26522]/30 rounded-2xl text-xs font-bold pos-card-shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#f26522]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1c1d22]">
            {filteredOrders.length}
          </div>
          <p className="text-[11px] text-[#8c91a4] mt-0.5">Matching current filters</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Filtered Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1c1d22]">
            {currency} {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Total sales volume</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Items Sold</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1c1d22]">
            {stats.totalItems}
          </div>
          <p className="text-[11px] text-[#8c91a4] mt-0.5">Dishes & items combined</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Avg. Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1c1d22]">
            {currency} {stats.avgOrder.toFixed(0)}
          </div>
          <p className="text-[11px] text-[#8c91a4] mt-0.5">Per ticket average</p>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-[#edf0f7] pos-card-shadow mb-6 space-y-4">
        {/* Row 1: Search & Date Presets */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Universal Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, Dish Name..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f26522] focus:bg-white transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 shrink-0">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" },
            ].map((preset) => {
              const active = datePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#f26522] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Custom Date Inputs */}
        {datePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs">
            <span className="font-bold text-[#f26522] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Custom Date Range:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#f26522]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#f26522]"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="text-[11px] text-red-500 font-bold hover:underline ml-auto"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}

        {/* Row 2: Secondary Dropdowns (Order Type, Payment, Sorting, Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Order Type */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Order Types</option>
                <option value="dine_in">Dine In</option>
                <option value="take_away">Take Away</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Payment Methods</option>
                <option value="cash">Cash Only</option>
                <option value="card">Card</option>
                <option value="online">Online / EasyPaisa / JazzCash</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-gray-700 font-bold focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="amount_high">Amount: High to Low</option>
                <option value="amount_low">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#edf0f7] pos-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer / Table</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Type & Payment</th>
                <th className="py-3.5 px-4">Amount / Tax</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isOrdersLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="w-10 h-10 text-[#f26522] animate-spin mb-3" />
                      <h4 className="text-base font-bold text-gray-700">Loading Orders...</h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
                        Fetching latest orders from database
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ShoppingBag className="w-12 h-12 stroke-[1.5] text-gray-300 mb-3" />
                      <h4 className="text-base font-bold text-gray-700">No Orders Found</h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
                        No orders match your search criteria. Try modifying your search or reset the filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl hover:bg-[#e05615] transition-all cursor-pointer shadow-sm"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const dateObj = new Date(ord.timestamp || ord.createdAt);
                  const isDineIn = ord.orderType === "dine_in";
                  const isDelivery = ord.orderType === "delivery";

                  return (
                    <tr key={ord.id || ord._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order # */}
                      <td className="py-4 px-6">
                        <div className="font-black text-sm text-[#1c1d22]">{ord.orderNumber}</div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ID: {(ord.id || ord._id || "").slice(-6)}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">
                          {dateObj.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </td>

                      {/* Customer / Table */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{ord.customerName || "Walk-in Customer"}</span>
                        </div>
                        {ord.customerPhone ? (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{ord.customerPhone}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Cashier: {ord.cashier || "Cashier"}
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="font-bold text-gray-700">
                          {ord.itemsCount || ord.items?.length || 0} items
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5" title={ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}>
                          {ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "-"}
                        </div>
                      </td>

                      {/* Order Type & Payment */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize ${
                              isDineIn
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isDelivery
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {ord.orderType?.replace("_", " ")} {ord.tableNumber && ord.tableNumber !== "-" ? `• ${ord.tableNumber}` : ""}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold inline-block">
                            {ord.paymentMethod || "Cash"}
                          </span>
                        </div>
                      </td>

                      {/* Amount & Tax */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-black text-sm text-[#1c1d22]">
                          {currency} {(ord.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Tax: {currency} {(ord.taxAmount || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleReprint(ord)}
                          className="px-3.5 py-1.5 bg-[#fff2eb] hover:bg-[#f26522] text-[#f26522] hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View & Reprint Thermal Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
