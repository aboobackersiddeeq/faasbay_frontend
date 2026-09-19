import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Store, AlertCircle } from "lucide-react";
import faasbayLogo from "@/assets/faasbay-logo.png";
import { API_ENDPOINTS } from "@/config/api";
import { apiRequestRaw, ApiError } from "@/lib/api-client";
import { saveAdminSession, type AdminUser } from "@/lib/admin-session";

interface AdminLoginGateProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export function AdminLoginGate({ onLoginSuccess }: AdminLoginGateProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  /**
   * Credentials are verified by the backend against a bcrypt hash in MongoDB.
   * Nothing is compared in the browser and no password ships in this bundle.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiRequestRaw<{ token: string; user: AdminUser }>(API_ENDPOINTS.adminLogin, {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });

      if (!result?.token || !result?.user) {
        setError("The server did not return a valid session. Please try again.");
        return;
      }

      saveAdminSession(result.token, result.user, rememberMe);
      onLoginSuccess(result.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 0
            ? "Could not reach the FaasBay server. Check that the backend is running."
            : err.message
        );
      } else {
        setError("An error occurred during authentication. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-slate-100">
          
          {/* Header & Brand */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner mb-4">
              <img src={faasbayLogo} alt="FaasBay" className="h-7 w-auto object-contain brightness-110" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Commerce OS Portal
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Admin Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access the management portal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@faasbay.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500/30 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Remember session</span>
              </label>
              <span className="text-[11px] text-slate-500">256-bit Encrypted</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-900/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Return link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium"
            >
              <Store className="w-3.5 h-3.5" /> Return to Customer Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
