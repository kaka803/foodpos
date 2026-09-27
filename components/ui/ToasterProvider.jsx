"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function ToasterProvider() {
  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        style: {
          borderRadius: "16px",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: "600",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
          border: "1px solid #edf0f7",
        },
      }}
    />
  );
}
