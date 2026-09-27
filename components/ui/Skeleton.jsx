import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-gray-200/70", className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] p-5 border border-[#edf0f7] pos-card-shadow flex flex-col items-center text-center animate-pulse">
      <div className="w-32 h-32 rounded-full bg-gray-100 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
      <div className="h-4 bg-orange-100 rounded-md w-1/3 mb-4"></div>
      <div className="h-8 bg-gray-100 rounded-xl w-full"></div>
    </div>
  );
}
