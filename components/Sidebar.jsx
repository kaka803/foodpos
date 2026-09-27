"use client";

import React from "react";
import { usePOS } from "../context/POSContext";
import {
  Home,
  LayoutGrid,
  UtensilsCrossed,
  ShoppingBag,
  History,
  Truck,
  Bell,
  Settings,
  Package,
  Layers,
  Receipt,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const { activeTab, setActiveTab, heldOrders, logout, authUser, settings } = usePOS();

  const cashierName = settings?.cashierName || authUser?.username || "Admin";
  const avatarLetter = (cashierName.trim()[0] || "A").toUpperCase();

  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "pos", label: "Menu", icon: UtensilsCrossed, badge: null },
    { id: "all_orders", label: "All Orders", icon: ShoppingBag },
    { id: "history", label: "History", icon: History },
    { id: "products", label: "Products", icon: Package, badge: null },
    { id: "purchases", label: "Purchases", icon: Truck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-[88px] min-h-screen bg-white border-r border-[#edf0f7] flex flex-col items-center py-6 justify-between select-none z-20 shrink-0 sticky top-0 h-screen">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setActiveTab("pos")}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#111827] to-[#1f2937] flex items-center justify-center relative shadow-sm hover:scale-105 transition-all group cursor-pointer"
          title="BitePOS Home"
        >
          {/* Logo symbol similar to screenshot */}
          <div className="w-6 h-6 rounded-full border-[3px] border-white relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#f26522] absolute top-[-2px] right-[-2px]"></span>
          </div>
        </button>

        {/* Navigation Icons matching screenshot */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "all_orders" && activeTab === "orders");

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex flex-col items-center justify-center w-16 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#fff2eb] text-[#f26522] font-semibold"
                    : "text-[#8c91a4] hover:text-[#1c1d22] hover:bg-[#f7f8fb]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#f26522] rounded-r-full"></span>
                )}
                
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#f26522]" : "text-current"}`} />
                  {item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#f26522] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[11px] mt-1 tracking-tight ${
                    isActive ? "text-[#f26522] font-bold" : "text-[#737787] font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {/* Floating tooltip */}
                <div className="absolute left-[78px] px-2.5 py-1 bg-[#1c1d22] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cashier Profile & Logout at Bottom */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setActiveTab("settings")}
          className="flex flex-col items-center group cursor-pointer"
          title={`Profile & Settings (${cashierName})`}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f26522] to-[#ff8c52] text-white flex items-center justify-center font-black text-sm uppercase shadow-sm border-2 border-white ring-2 ring-[#edf0f7] group-hover:ring-[#f26522] transition-all">
              {avatarLetter}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="text-[10px] font-semibold text-[#8c91a4] mt-1 group-hover:text-[#1c1d22] max-w-[72px] truncate text-center">
            {cashierName.split(" ")[0]}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-all group relative cursor-pointer"
          title="Sign Out / Lock Terminal"
        >
          <LogOut className="w-4 h-4" />
          <div className="absolute left-[54px] px-2.5 py-1 bg-[#1c1d22] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg whitespace-nowrap z-50">
            Sign Out
          </div>
        </button>
      </div>
    </aside>
  );
}
