"use client";

import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  History,
  Search,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  UtensilsCrossed,
  Clock,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  X,
  Loader2,
  RotateCcw
} from "lucide-react";

export default function TodayHistory() {
  const { orders, settings, setCompletedOrder, setActiveModal, setActiveTab, isOrdersLoading, refreshOrders } = usePOS();
  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Strictly filter orders to TODAY only
  const todayOrders = useMemo(() => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return orders.filter((o) => {
      if (!o.timestamp && !o.createdAt) return false;
      const orderDate = new Date(o.timestamp || o.createdAt);
      return (
        orderDate.getFullYear() === todayYear &&
        orderDate.getMonth() === todayMonth &&
        orderDate.getDate() === todayDate
      );
    });
  }, [orders]);

  // Filtered by search / type / payment among today's orders
  const filteredTodayOrders = useMemo(() => {
    return todayOrders.filter((o) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q));

      const matchType = typeFilter === "all" || o.orderType === typeFilter;
      const matchPayment =
        paymentFilter === "all" ||
        (o.paymentMethod || "").toLowerCase().includes(paymentFilter.toLowerCase());

      return matchSearch && matchType && matchPayment;
    });
  }, [todayOrders, searchTerm, typeFilter, paymentFilter]);

  // Today's summary metrics
  const todayMetrics = useMemo(() => {
    const totalSales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTax = todayOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
    const cashSales = todayOrders
      .filter((o) => (o.paymentMethod || "").toLowerCase() === "cash")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const digitalSales = totalSales - cashSales;

    const dineInCount = todayOrders.filter((o) => o.orderType === "dine_in").length;
    const takeawayCount = todayOrders.filter((o) => o.orderType === "take_away").length;
    const deliveryCount = todayOrders.filter((o) => o.orderType === "delivery").length;

    return {
      totalSales,
      totalTax,
      cashSales,
      digitalSales,
      dineInCount,
      takeawayCount,
      deliveryCount,
    };
  }, [todayOrders]);

  const handleReprint = (order) => {
    setCompletedOrder(order);
    setActiveModal("invoice");
  };

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#1c1d22] tracking-tight">
              Today's Orders History
            </h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Today
            </span>
          </div>
          <p className="text-sm text-[#737787] mt-1 flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-[#f26522]" />
            <span>{todayFormatted}</span>
            <span className="text-gray-300">•</span>
            <span>Showing today's transactions only</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshOrders()}
            disabled={isOrdersLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] rounded-2xl text-xs font-bold pos-card-shadow transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh today's orders"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#f26522] ${isOrdersLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f26522] hover:bg-[#e05615] text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer w-fit"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>New Order (POS)</span>
          </button>
        </div>
      </div>

      {/* Today's KPI Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#f26522]">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1c1d22]">
            {todayOrders.length}
          </div>
          <div className="text-[11px] text-[#8c91a4] mt-1 flex items-center gap-1.5">
            <span>Dine: <b>{todayMetrics.dineInCount}</b></span>
            <span>•</span>
            <span>Takeaway: <b>{todayMetrics.takeawayCount}</b></span>
            <span>•</span>
            <span>Deliv: <b>{todayMetrics.deliveryCount}</b></span>
          </div>
        </div>

        {/* Card 2: Today's Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Today's Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1c1d22]">
            {currency} {todayMetrics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            Tax Collected: {currency} {todayMetrics.totalTax.toFixed(0)}
          </p>
        </div>

        {/* Card 3: Cash Collected */}
        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Cash in Drawer</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1c1d22]">
            {currency} {todayMetrics.cashSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#8c91a4] mt-1">Cash payment receipts</p>
        </div>

        {/* Card 4: Digital / Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between text-[#737787] mb-1.5">
            <span className="text-xs font-semibold">Card / Online</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1c1d22]">
            {currency} {todayMetrics.digitalSales.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#8c91a4] mt-1">Card, EasyPaisa, JazzCash</p>
        </div>
      </div>

      {/* Filter Toolbar for Today */}
      <div className="bg-white p-4 rounded-3xl border border-[#edf0f7] pos-card-shadow mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search today's order #, customer..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f26522] focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type & Payment Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 font-bold focus:outline-none focus:border-[#f26522] cursor-pointer"
          >
            <option value="all">All Order Types</option>
            <option value="dine_in">Dine In</option>
            <option value="take_away">Take Away</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 font-bold focus:outline-none focus:border-[#f26522] cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>

          {(searchTerm || typeFilter !== "all" || paymentFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setPaymentFilter("all");
              }}
              className="text-xs font-bold text-red-500 hover:underline px-2 py-1"
            >
              Clear
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
                <th className="py-3.5 px-4">Time Placed</th>
                <th className="py-3.5 px-4">Customer & Type</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Payment Method</th>
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
                      <h4 className="text-base font-bold text-gray-700">Loading Today's Orders...</h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
                        Fetching latest orders from database
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTodayOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <History className="w-12 h-12 stroke-[1.5] text-gray-300 mb-3" />
                      <h4 className="text-base font-bold text-gray-700">
                        {todayOrders.length === 0 ? "No Orders Placed Today Yet" : "No Matching Orders Found Today"}
                      </h4>
                      <p className="text-xs text-gray-400 max-w-xs mt-1">
                        {todayOrders.length === 0
                          ? "Take your first customer order of the day from the Menu tab."
                          : "Try adjusting your search or filters to view today's orders."}
                      </p>
                      {todayOrders.length === 0 && (
                        <button
                          onClick={() => setActiveTab("pos")}
                          className="mt-4 px-4 py-2 bg-[#f26522] text-white text-xs font-bold rounded-xl hover:bg-[#e05615] transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <span>Go to POS Menu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTodayOrders.map((ord) => {
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

                      {/* Time Placed */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#f26522]" />
                          <span>{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Today
                        </div>
                      </td>

                      {/* Customer & Type */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{ord.customerName || "Walk-in Customer"}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize inline-block ${
                              isDineIn
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : isDelivery
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {ord.orderType?.replace("_", " ")} {ord.tableNumber && ord.tableNumber !== "-" ? `• ${ord.tableNumber}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Items Ordered */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="font-bold text-gray-700">
                          {ord.itemsCount || ord.items?.length || 0} items
                        </div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5" title={ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ")}>
                          {ord.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "-"}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold inline-block text-[11px]">
                          {ord.paymentMethod || "Cash"}
                        </span>
                      </td>

                      {/* Amount / Tax */}
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
