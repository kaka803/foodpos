"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'primary'
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              variant === "danger"
                ? "bg-rose-50 text-rose-600"
                : "bg-orange-50 text-[#f26522]"
            }`}
          >
            {variant === "danger" ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-extrabold text-[#1c1d22] mb-1.5">{title}</h3>
        <p className="text-xs text-[#737787] mb-6 leading-relaxed">{description}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 text-white rounded-2xl text-xs font-extrabold shadow-md transition-all cursor-pointer ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                : "bg-[#f26522] hover:bg-[#e05413] shadow-orange-200"
            }`}
          >
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
