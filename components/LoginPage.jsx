"use client";

import React, { useState } from "react";
import { usePOS } from "../context/POSContext";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles, UtensilsCrossed } from "lucide-react";

export default function LoginPage() {
  const { login, settings } = usePOS();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid username or password");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 relative overflow-hidden select-none">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#f26522]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-white">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f26522] to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 transform hover:scale-105 transition-all">
            <UtensilsCrossed className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>{settings?.shopName || "Crispy Bites POS"}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            Point of Sale • Terminal Authentication
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0"></div>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                disabled={isLoading}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f26522] focus:border-transparent transition-all font-medium disabled:opacity-50"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                disabled={isLoading}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f26522] focus:border-transparent transition-all font-medium disabled:opacity-50"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Secure Terminal Login
            </span>
            <span className="text-gray-500">v1.0.0</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#f26522] to-[#ea580c] hover:from-[#e05615] hover:to-[#d94e08] text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
