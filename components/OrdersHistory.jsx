"use client";

import React, { useState, useMemo } from "react";
import { usePOS } from "../context/POSContext";
import {
  History,
  Search,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Banknote,
  Eye,
  CheckCircle2
} from "lucide-react";

export default function OrdersHistory() {
  const { orders, settings, setCompletedOrder, setActiveModal } = usePOS();
  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.cashier?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === "all" || o.orderType === typeFilter;
      const matchPayment = paymentFilter === "all" || o.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());

      return matchSearch && matchType && matchPayment;
    });
  }, [orders, searchTerm, typeFilter, paymentFilter]);

  const handleReprint = (order) => {
    setCompletedOrder(order);
    setActiveModal("invoice");
  };

  const totalFilteredSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1c1d22] tracking-tight">
            Order Invoices & Billing History
          </h1>
          <p className="text-sm text-[#737787] mt-1">
            Complete record of all sales, payments received, and printable customer receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#edf0f7] pos-card-shadow text-xs font-bold text-[#1c1d22]">
            Total Records: <span className="text-[#f26522]">{filteredOrders.length} Invoices</span>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#edf0f7] pos-card-shadow mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f26522]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 font-semibold focus:outline-none focus:border-[#f26522]"
          >
            <option value="all">All Order Types</option>
            <option value="dine_in">Dine In</option>
            <option value="take_away">Take Away</option>
            <option value="delivery">Delivery</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 font-semibold focus:outline-none focus:border-[#f26522]"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online / EasyPaisa</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#edf0f7] pos-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer / Table</th>
                <th className="py-3.5 px-4">Items Ordered</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Tax / Total</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-sm text-[#1c1d22]">{ord.orderNumber}</div>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {ord.id}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-700">
                        {new Date(ord.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-800">{ord.customerName}</div>
                      <div className="text-[10px] text-gray-500 capitalize">
                        {ord.orderType.replace("_", " ")} {ord.tableNumber !== "-" ? `• ${ord.tableNumber}` : ""}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-700">{ord.itemsCount} items</div>
                      <div className="text-[10px] text-gray-400 line-clamp-1 max-w-[180px]">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold inline-block">
                        {ord.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-extrabold text-sm text-[#1c1d22]">
                        {currency} {ord.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Tax: {currency} {ord.taxAmount.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleReprint(ord)}
                        className="px-3 py-1.5 bg-[#fff2eb] hover:bg-[#f26522] text-[#f26522] hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View & Reprint Thermal Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
