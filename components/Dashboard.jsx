"use client";

import React, { useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  UtensilsCrossed,
  Sparkles,
  Plus,
  Loader2,
  RotateCcw
} from "lucide-react";

export default function Dashboard() {
  const {
    orders,
    products,
    settings,
    setActiveTab,
    setCompletedOrder,
    setActiveModal,
    isOrdersLoading,
    refreshOrders
  } = usePOS();

  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  // Aggregate Stats
  const totalSales = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const totalOrdersCount = orders.length;

  const totalItemsSold = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.itemsCount || 0), 0);
  }, [orders]);

  const avgOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

  // Category sales breakdown
  const categoryStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.id || p.name === item.name);
        const cat = prod?.category || "other";
        map[cat] = (map[cat] || 0) + item.price * item.quantity;
      });
    });

    const totalCatSales = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalCatSales) * 100)
    })).sort((a, b) => b.amount - a.amount);
  }, [orders, products]);

  // Payment Breakdown
  const paymentStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const pm = o.paymentMethod || "Cash";
      map[pm] = (map[pm] || 0) + o.total;
    });
    return Object.entries(map).map(([method, total]) => ({
      method,
      total,
      percentage: totalSales > 0 ? Math.round((total / totalSales) * 100) : 0
    }));
  }, [orders, totalSales]);

  // Top selling products
  const topProducts = useMemo(() => {
    return [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
  }, [products]);

  const handleViewReceipt = (order) => {
    setCompletedOrder(order);
    setActiveModal("invoice");
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#1c1d22] tracking-tight">
              Shop Dashboard & Overview
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Live POS Terminal
            </span>
          </div>
          <p className="text-sm text-[#737787] mt-1">
            Welcome back, <span className="font-semibold text-[#1c1d22]">{settings.cashierName}</span>. Here's your sales summary for today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshOrders()}
            disabled={isOrdersLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#edf0f7] text-[#1c1d22] hover:text-[#f26522] rounded-2xl text-xs font-bold pos-card-shadow transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#f26522] ${isOrdersLoading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className="flex items-center gap-2 px-5 py-3 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-sm font-extrabold shadow-lg active-pill-shadow transition-all cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
        </div>
      </div>

      {/* On-Demand Loading Banner */}
      {isOrdersLoading && (
        <div className="mb-6 p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-3 text-xs text-[#f26522] font-bold shadow-xs">
          <Loader2 className="w-4 h-4 animate-spin text-[#f26522]" />
          <span>Loading live sales analytics and order records from database...</span>
        </div>
      )}

      {/* 4 Hero Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8c91a4] uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fff2eb] text-[#f26522] flex items-center justify-center font-bold text-xs">
              {currency}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl xl:text-3xl font-extrabold text-[#1c1d22]">
              {currency} {Number(totalSales).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% today</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8c91a4] uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl xl:text-3xl font-extrabold text-[#1c1d22]">
              {totalOrdersCount} Orders
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Settled</span>
            </div>
          </div>
        </div>

        {/* Items Sold */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8c91a4] uppercase tracking-wider">
              Items Sold
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl xl:text-3xl font-extrabold text-[#1c1d22]">
              {totalItemsSold} Items
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-500">
              <span>Pizzas & Burgers leading</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8c91a4] uppercase tracking-wider">
              Average Bill
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl xl:text-3xl font-extrabold text-[#1c1d22]">
              {currency} {avgOrderValue.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-purple-600">
              <span>Per transaction avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Category Sales Share */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow">
          <h3 className="text-base font-bold text-[#1c1d22] mb-1">Sales by Category</h3>
          <p className="text-xs text-[#8c91a4] mb-4">Fast food revenue distribution</p>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No sales data recorded yet.</p>
            ) : (
              categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-[#1c1d22]">{cat.category}</span>
                    <span className="text-[#f26522]">{currency} {cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#f26522] to-amber-400 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Fast Food Items */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1d22]">Top Selling Food Items</h3>
              <p className="text-xs text-[#8c91a4]">Most popular items ordered by customers</p>
            </div>
            <button
              onClick={() => setActiveTab("products")}
              className="text-xs font-bold text-[#f26522] hover:underline flex items-center gap-1"
            >
              <span>View All Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#f4f6fa]">
            {topProducts.map((p, index) => (
              <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-extrabold flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#1c1d22]">{p.name}</h4>
                    <span className="text-xs text-gray-500 capitalize">{p.category} • {currency} {p.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#1c1d22]">{p.salesCount || 0} Sold</span>
                  <div className="text-xs text-emerald-600 font-semibold">High Demand</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Invoices Table */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1d22]">Recent Invoices</h3>
              <p className="text-xs text-[#8c91a4]">Live register order records</p>
            </div>
            <button
              onClick={() => setActiveTab("all_orders")}
              className="text-xs font-bold text-[#f26522] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer / Table</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 font-bold text-[#1c1d22]">{ord.orderNumber}</td>
                    <td className="py-3">
                      <div className="font-semibold text-gray-800">{ord.customerName}</div>
                      <div className="text-[10px] text-gray-500 capitalize">
                        {ord.orderType.replace("_", " ")} {ord.tableNumber !== "-" ? `• ${ord.tableNumber}` : ""}
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{ord.itemsCount} items</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-medium">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 font-extrabold text-[#1c1d22]">
                      {currency} {ord.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleViewReceipt(ord)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-[#fff2eb] text-gray-700 hover:text-[#f26522] rounded-lg font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Reprint Bill"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#edf0f7] pos-card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1c1d22]">
                Payment Methods
              </h3>
              <p className="text-xs text-[#8c91a4]">Settlement summary by type</p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentStats.map((item) => (
              <div
                key={item.method}
                className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#1c1d22]">{item.method}</div>
                  <div className="text-[10px] text-gray-500">{item.percentage}% of total sales</div>
                </div>
                <div className="text-sm font-extrabold text-[#f26522]">
                  {currency} {item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
