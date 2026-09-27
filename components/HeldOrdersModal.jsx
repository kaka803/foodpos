"use client";

import React from "react";
import { usePOS } from "../context/POSContext";
import { Clock, Play, Trash2, X, ShoppingBag } from "lucide-react";

export default function HeldOrdersModal() {
  const { activeModal, setActiveModal, heldOrders, resumeHeldOrder, settings } = usePOS();

  if (activeModal !== "heldOrders") return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1d22]">Parked / Held Orders</h3>
              <p className="text-xs text-[#8c91a4]">{heldOrders.length} orders on hold</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-bold text-gray-600">No orders currently on hold</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Use "Hold Order" in POS to pause an order during rush hours.</p>
            </div>
          ) : (
            heldOrders.map((h) => (
              <div
                key={h.heldId}
                className="p-3.5 bg-gray-50 hover:bg-amber-50/40 border border-gray-200 hover:border-amber-300 rounded-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-sm text-[#1c1d22]">{h.orderNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-gray-700 rounded-md border border-gray-200">
                    {h.time} • {h.orderType.toUpperCase()} {h.tableNumber !== "-" ? `(${h.tableNumber})` : ""}
                  </span>
                </div>

                <div className="text-xs text-gray-500 line-clamp-1 mb-3">
                  {h.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                  <span className="text-sm font-extrabold text-[#f26522]">
                    {(settings?.currency && settings.currency !== "$") ? settings.currency : "Rs."} {Number(h.total).toLocaleString()}
                  </span>

                  <button
                    onClick={() => resumeHeldOrder(h.heldId)}
                    className="px-3.5 py-1.5 bg-[#f26522] hover:bg-[#e05413] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume Order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
