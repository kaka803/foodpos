"use client";

import React from "react";
import { usePOS } from "../context/POSContext";
import Sidebar from "../components/Sidebar";
import POSBilling from "../components/POSBilling";
import Dashboard from "../components/Dashboard";
import ProductsManager from "../components/ProductsManager";
import AllOrders from "../components/AllOrders";
import TodayHistory from "../components/TodayHistory";
import StockPurchasing from "../components/StockPurchasing";
import InvoiceModal from "../components/InvoiceModal";
import AddProductModal from "../components/AddProductModal";
import DealBuilderModal from "../components/DealBuilderModal";
import HeldOrdersModal from "../components/HeldOrdersModal";
import SettingsModal from "../components/SettingsModal";
import LoginPage from "../components/LoginPage";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { activeTab, isAuthenticated, isCheckingAuth } = usePOS();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="w-10 h-10 text-[#f26522] animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide text-gray-400">Loading BitePOS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <main className="min-h-screen flex bg-[#f4f6fa] text-[#1c1d22] overflow-x-hidden">
      {/* Sleek Left Navigation Sidebar matching reference */}
      <Sidebar />

      {/* Main Content Area based on active navigation tab */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {activeTab === "pos" && <POSBilling />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "products" && <ProductsManager />}
        {(activeTab === "all_orders" || activeTab === "orders") && <AllOrders />}
        {activeTab === "history" && <TodayHistory />}
        {activeTab === "purchases" && <StockPurchasing />}
        {activeTab === "settings" && <SettingsModal />}
      </div>

      {/* Global Modals */}
      <InvoiceModal />
      <AddProductModal />
      <DealBuilderModal />
      <HeldOrdersModal />
    </main>
  );
}
