"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "../context/POSContext";
import { Printer, CheckCircle2, CreditCard, Banknote, Smartphone, X, Download, Share2, Sparkles, Sliders } from "lucide-react";
import confetti from "canvas-confetti";
import { printThermalReceipt } from "../lib/thermalPrinter";

export default function InvoiceModal() {
  const {
    activeModal,
    setActiveModal,
    cart,
    clearCart,
    currentOrderNumber,
    orderType,
    tableNumber,
    cartItemCount,
    subtotal,
    taxAmount,
    grandTotal,
    settings,
    completeOrder,
    completedOrder,
    setCompletedOrder
  } = usePOS();

  const currency = settings?.currency && settings.currency !== "$" ? settings.currency : "Rs.";

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isOrderFinalized, setIsOrderFinalized] = useState(false);
  const [paperSize, setPaperSize] = useState(settings?.receiptPaperSize || "80mm");

  useEffect(() => {
    if (settings?.receiptPaperSize) {
      setPaperSize(settings.receiptPaperSize);
    }
  }, [settings?.receiptPaperSize]);

  // If order was already finalized or we are finalizing active cart:
  const activeOrderData = completedOrder || {
    orderNumber: `#${currentOrderNumber}`,
    timestamp: new Date().toISOString(),
    customerName: customerName || "Walk-in Customer",
    customerPhone: customerPhone || "",
    orderType,
    tableNumber: orderType === "dine_in" ? tableNumber : "-",
    items: cart,
    itemsCount: cartItemCount,
    subtotal,
    taxRate: settings?.taxRate || 0,
    taxAmount,
    total: grandTotal,
    paymentMethod,
    cashier: settings?.cashierName || "Cashier"
  };

  const tenderAmount = parseFloat(amountReceived) || activeOrderData.total;
  const changeDue = Math.max(0, tenderAmount - activeOrderData.total);

  const resetAllFields = () => {
    setAmountReceived("");
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("Cash");
    setIsOrderFinalized(false);
    setCompletedOrder(null);
    clearCart();
  };

  const handlePrint = async () => {
    let orderToPrint = activeOrderData;

    // If not yet finalized, complete order first
    if (!completedOrder && cart.length > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      await completeOrder(paymentMethod, tenderAmount, {
        name: customerName,
        phone: customerPhone
      });
      
      setIsOrderFinalized(true);
      clearCart();

      orderToPrint = {
        ...activeOrderData,
        tenderAmount,
        changeDue,
        paymentMethod,
        customerName: customerName || activeOrderData.customerName,
        customerPhone: customerPhone || activeOrderData.customerPhone,
      };
    } else {
      orderToPrint = {
        ...activeOrderData,
        tenderAmount: tenderAmount || activeOrderData.total,
        changeDue,
        paymentMethod,
        customerName: customerName || activeOrderData.customerName,
        customerPhone: customerPhone || activeOrderData.customerPhone,
      };
    }
    
    // Print isolated clean thermal receipt without popup or billing UI
    printThermalReceipt(orderToPrint, settings, paperSize);
  };

  const handleFinalizeOrder = async () => {
    if (completedOrder) return;
    
    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    await completeOrder(paymentMethod, tenderAmount, {
      name: customerName,
      phone: customerPhone
    });
    
    setIsOrderFinalized(true);
    clearCart(); // Ensure cart is cleared to 0 items
  };

  const handleClose = () => {
    resetAllFields();
    setActiveModal(null);
  };

  if (activeModal !== "invoice") return null;

  const quickCashOptions = [
    Math.ceil(activeOrderData.total),
    500,
    1000,
    2000,
    5000
  ].filter((v, i, a) => a.indexOf(v) === i && v >= activeOrderData.total);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
        
        {/* LEFT COLUMN: Payment Tender & Options */}
        <div className="flex-1 p-6 md:p-8 bg-[#f8f9fd] flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#f26522] uppercase tracking-wider">
                  Checkout & Billing
                </span>
                <h2 className="text-2xl font-extrabold text-[#1c1d22]">
                  {activeOrderData.orderNumber}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#fff2eb] text-[#f26522] rounded-full text-xs font-bold uppercase">
                  {activeOrderData.orderType.replace("_", " ")}
                </span>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer transition-all font-bold"
                  title="Close & New Order"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: "Cash", label: "Cash", icon: Banknote },
                  { id: "Card", label: "Debit / Credit", icon: CreditCard },
                  { id: "Online", label: "EasyPaisa / QR", icon: Smartphone }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      disabled={isOrderFinalized}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#f26522] shadow-md ring-2 ring-[#f26522]/20"
                          : "bg-white/60 border-gray-200 hover:bg-white text-gray-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? "text-[#f26522]" : "text-gray-400"}`} />
                      <span className={`text-xs font-bold ${isSelected ? "text-[#1c1d22]" : "text-gray-600"}`}>
                        {pm.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender Input & Change */}
            {paymentMethod === "Cash" && (
              <div className="mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Amount Received ({currency})</label>
                  <span className="text-xs text-gray-400">Total: {currency} {Number(activeOrderData.total).toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  disabled={isOrderFinalized}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={activeOrderData.total.toString()}
                  className="w-full text-xl font-extrabold px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]"
                />

                {/* Quick preset cash amounts */}
                {!isOrderFinalized && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {quickCashOptions.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmountReceived(amt.toString())}
                        className="px-3 py-1 bg-gray-100 hover:bg-[#fff2eb] hover:text-[#f26522] text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        {currency} {amt}
                      </button>
                    ))}
                    <button
                      onClick={() => setAmountReceived(activeOrderData.total.toString())}
                      className="px-3 py-1 bg-gray-100 hover:bg-[#fff2eb] hover:text-[#f26522] text-gray-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Exact
                    </button>
                  </div>
                )}

                {/* Change Due Display */}
                <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Change Due:</span>
                  <span className={`text-base font-extrabold ${changeDue > 0 ? "text-emerald-600" : "text-gray-800"}`}>
                    {currency} {Number(changeDue).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Optional Customer Info */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  disabled={isOrderFinalized}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ali Khan"
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f26522]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  disabled={isOrderFinalized}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f26522]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-4">
            {!completedOrder && !isOrderFinalized ? (
              <button
                onClick={handleFinalizeOrder}
                className="w-full py-3.5 bg-[#f26522] hover:bg-[#e05413] text-white rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg active-pill-shadow cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Settle Payment</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Order successfully settled and saved to sales record!</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-[#1c1d22] hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>
              
              <button
                onClick={handleClose}
                className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Printable Thermal POS Receipt Preview */}
        <div className="w-full md:w-[360px] bg-white p-6 border-l border-gray-100 flex flex-col justify-between overflow-y-auto">
          {/* Thermal Receipt Container */}
          <div
            id="printable-receipt"
            className="p-4 bg-[#fffefc] border border-gray-200 rounded-xl shadow-inner font-mono text-xs text-gray-900 leading-tight select-text"
          >
            {/* Shop Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-300">
              <h3 className="font-bold text-sm tracking-wider uppercase text-black">
                {settings.shopName}
              </h3>
              <p className="text-[10px] text-gray-600 mt-0.5">{settings.tagline}</p>
              <p className="text-[10px] text-gray-600">{settings.address}</p>
              <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 border-b border-dashed border-gray-300 space-y-0.5 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>INVOICE: {activeOrderData.orderNumber}</span>
                <span>TABLE: {activeOrderData.tableNumber}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[10px]">
                <span>Date: {new Date(activeOrderData.timestamp).toLocaleDateString()}</span>
                <span>Time: {new Date(activeOrderData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-[10px]">
                <span>Type: {activeOrderData.orderType.toUpperCase()}</span>
                <span>Cashier: {activeOrderData.cashier}</span>
              </div>
              {customerName && (
                <div className="text-[10px] text-gray-700 font-semibold">
                  Customer: {customerName}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="py-3 border-b border-dashed border-gray-300 space-y-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-gray-700 pb-1 border-b border-gray-200">
                <span>Item</span>
                <span className="text-right">Qty x Price = Total</span>
              </div>

              {activeOrderData.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="shrink-0">
                      {currency} {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span className="italic pl-2">{item.notes ? `* ${item.notes}` : ""}</span>
                    <span>{item.quantity} x {currency} {item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency} {activeOrderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({activeOrderData.taxRate}%):</span>
                <span>{currency} {activeOrderData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>{currency} {activeOrderData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                <span>Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>
              {paymentMethod === "Cash" && (
                <>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Cash Tendered:</span>
                    <span>{currency} {tenderAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-800">
                    <span>Change Due:</span>
                    <span>{currency} {changeDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 text-center text-[10px] text-gray-600 space-y-1">
              <p className="font-semibold">{settings.invoiceFooter}</p>
              <p className="text-[9px] text-gray-400">Powered by BitePOS System</p>
              <div className="flex justify-center pt-1 font-mono tracking-widest text-[9px]">
                * * * THANK YOU * * *
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleClose}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
