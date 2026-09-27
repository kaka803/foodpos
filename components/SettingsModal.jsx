"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "../context/POSContext";
import { Store, DollarSign, Percent, User, MapPin, Phone, CheckCircle2, RotateCcw, X, Printer, Sliders } from "lucide-react";
import { printThermalReceipt } from "../lib/thermalPrinter";

export default function SettingsModal() {
  const { activeTab, setActiveTab, settings, updateSettings } = usePOS();
  const [tempSettings, setTempSettings] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setTempSettings({ ...settings });
    }
  }, [settings]);

  if (activeTab !== "settings") return null;

  const handleSave = async (e) => {
    e.preventDefault();
    await updateSettings(tempSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePrintTest = () => {
    const testOrder = {
      orderNumber: "#TEST-01",
      timestamp: new Date().toISOString(),
      orderType: "dine_in",
      tableNumber: "T1",
      cashier: tempSettings.cashierName || "Cashier",
      customerName: "Test Customer",
      customerPhone: "0300-1234567",
      items: [
        { name: "Zinger Burger Delight", price: 450, quantity: 2, notes: "Extra crispy" },
        { name: "Crispy French Fries (L)", price: 200, quantity: 1 },
        { name: "Cold Drink (Can)", price: 100, quantity: 2 },
      ],
      subtotal: 1300,
      taxRate: tempSettings.taxRate || 0,
      taxAmount: (1300 * (tempSettings.taxRate || 0)) / 100,
      total: 1300 + (1300 * (tempSettings.taxRate || 0)) / 100,
      paymentMethod: "Cash",
      tenderAmount: 1500,
    };
    printThermalReceipt(testOrder, tempSettings, tempSettings.receiptPaperSize || "80mm");
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto max-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1c1d22] tracking-tight">
              POS Settings & Shop Profile
            </h1>
            <p className="text-sm text-[#737787] mt-1">
              Customize receipt header, currency ($, Rs, PKR), tax rates, and cashier terminal info.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("pos")}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            Back to POS
          </button>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings updated successfully! Changes reflected across billing & printed receipts.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Shop Information */}
          <div className="bg-white p-6 rounded-3xl border border-[#edf0f7] pos-card-shadow space-y-4">
            <h2 className="text-base font-bold text-[#1c1d22] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#f26522]" />
              <span>Fast Food Shop Details</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shop / Restaurant Name
                </label>
                <input
                  type="text"
                  value={tempSettings.shopName}
                  onChange={(e) => setTempSettings({ ...tempSettings, shopName: e.target.value })}
                  placeholder="Crispy Bites & Fast Food"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={tempSettings.tagline}
                  onChange={(e) => setTempSettings({ ...tempSettings, tagline: e.target.value })}
                  placeholder="Fresh, Hot & Crispy Fast Food"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shop Address (Printed on Bill)
                </label>
                <input
                  type="text"
                  value={tempSettings.address}
                  onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                  placeholder="Shop #4, Food Street, Main Market"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone / Contact Numbers
                </label>
                <input
                  type="text"
                  value={tempSettings.phone}
                  onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
                />
              </div>
            </div>
          </div>

          {/* Billing & Tax Settings */}
          <div className="bg-white p-6 rounded-3xl border border-[#edf0f7] pos-card-shadow space-y-4">
            <h2 className="text-base font-bold text-[#1c1d22] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#f26522]" />
              <span>Currency & Tax Configuration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Currency Symbol
                </label>
                <div className="flex gap-2">
                  {["Rs.", "PKR", "$", "₹", "AED", "£"].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, currency: sym })}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        tempSettings.currency === sym
                          ? "bg-[#fff2eb] text-[#f26522] border-[#f26522]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={tempSettings.taxRate}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="10"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Active Cashier Name
                </label>
                <input
                  type="text"
                  value={tempSettings.cashierName}
                  onChange={(e) => setTempSettings({ ...tempSettings, cashierName: e.target.value })}
                  placeholder="Hassan (Terminal 1)"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Receipt Footer Message
              </label>
              <input
                type="text"
                value={tempSettings.invoiceFooter}
                onChange={(e) => setTempSettings({ ...tempSettings, invoiceFooter: e.target.value })}
                placeholder="Thank you for dining with us! Please visit again."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f26522]"
              />
            </div>
          </div>

          {/* Thermal Receipt Printer Setup */}
          <div className="bg-white p-6 rounded-3xl border border-[#edf0f7] pos-card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#1c1d22] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#f26522]" />
                <span>Thermal Receipt Printer Setup</span>
              </h2>
              <button
                type="button"
                onClick={handlePrintTest}
                className="px-3.5 py-1.5 bg-[#1c1d22] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Prints a sample receipt directly on your connected thermal printer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Test Receipt</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Default Receipt Roll Width
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "80mm", label: "80mm (3-inch)", desc: "Standard POS roll (Epson, POS-80, Xprinter)" },
                    { id: "58mm", label: "58mm (2-inch)", desc: "Mini compact POS roll (POS-58, Bluetooth)" },
                  ].map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setTempSettings({ ...tempSettings, receiptPaperSize: size.id })}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        (tempSettings.receiptPaperSize || "80mm") === size.id
                          ? "bg-[#fff2eb] text-[#f26522] border-[#f26522] ring-2 ring-[#f26522]/20 shadow-xs"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xs font-black">{size.label}</span>
                      <span className="text-[10px] text-gray-500 leading-tight">{size.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Thermal Printing Guide
                </label>
                <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-2xl text-[11px] text-orange-950 leading-relaxed space-y-1">
                  <p className="font-bold text-[#f26522]">✓ Optimized for Continuous Roll Paper</p>
                  <p>In your Windows printer settings or Chrome print dialog: select your <strong>Thermal Printer</strong>, paper size <strong>80mm / Receipt</strong>, and set Margins to <strong>None</strong> for edge-to-edge printing with no A4 paper waste.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-sm font-extrabold shadow-lg active-pill-shadow transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
