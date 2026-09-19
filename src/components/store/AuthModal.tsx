import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import faasbayLogo from "@/assets/faasbay-logo.png";

export function AuthModal() {
  const { isAuthOpen, closeAuthModal, userProfile, loginUser, logoutUser } = useCart();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"input" | "otp">("input");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0] || "";
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
      if (nextInput) nextInput.focus();
    }
  };

  const handleSendOtpOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMethod === "phone") {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);

        // Details entered here are all we have. A returning shopper's saved profile
        // is restored separately from their own device by the cart provider — we
        // deliberately do not look a stranger's address up by phone number.
        const savedName = name.trim();
        const savedEmail = email.trim();
        const savedAddress = "";
        const savedCity = "";
        const savedPincode = "";
        const savedState = "";

        loginUser({
          name: savedName || `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10),
          email: savedEmail || `${cleanPhone}@faasbay.customer`,
          address: savedAddress,
          city: savedCity,
          pincode: savedPincode,
          state: savedState,
        });
        closeAuthModal();
      }, 500);
    } else {
      // Email login
      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        loginUser({
          name: name.trim() || email.split("@")[0] || "Valued Customer",
          phone: phone.trim() || "",
          email: email.trim(),
          address: "",
          city: "",
          pincode: "",
        });
        closeAuthModal();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border border-black/[0.08] dark:border-white/10 shadow-2xl z-10">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 px-5 py-4 bg-secondary/30">
          <div className="flex items-center gap-2">
            <img src={faasbayLogo} alt="FaasBay" className="h-6 w-auto object-contain" />
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* LOGGED IN ACCOUNT VIEW */}
        {userProfile ? (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06] dark:border-white/10">
              <div className="grid h-13 w-13 place-items-center rounded-2xl bg-[#B0CB1F] text-slate-950 font-black text-lg shadow-sm">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-black text-base text-foreground truncate">
                  {userProfile.name}
                </h3>
                <p className="text-xs text-neutral-500 truncate">{userProfile.phone || userProfile.email}</p>
                <div className="inline-flex items-center gap-1 mt-1 rounded-md bg-[#B0CB1F]/15 px-2 py-0.5 text-[10px] font-bold text-[#5b6a07] dark:text-[#B0CB1F]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified FaasBay Member</span>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  const el = document.getElementById("catalog-section") || document.querySelector("main");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-secondary/40 transition-colors text-left text-xs font-bold text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-foreground">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block">My Orders & Tracking</span>
                    <span className="text-[10.5px] font-normal text-neutral-500">View real-time dispatch updates</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  const el = document.getElementById("catalog-section") || document.querySelector("main");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-secondary/40 transition-colors text-left text-xs font-bold text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-foreground">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block">Saved Delivery Addresses</span>
                    <span className="text-[10.5px] font-normal text-neutral-500">Quick 1-tap checkout enabled</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                logoutUser();
              }}
              className="w-full min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100/60 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* AUTH LOGIN / SIGNUP FORM */
          <div className="p-6 space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="font-display text-xl font-black text-foreground">
                {step === "otp" ? "Verify Mobile Number" : tab === "login" ? "Welcome Back to FaasBay" : "Create FaasBay Account"}
              </h3>
              <p className="text-xs text-neutral-500">
                {step === "otp"
                  ? `Enter the 4-digit code sent to ${phone}`
                  : "Log in to track orders, manage addresses, and checkout faster."}
              </p>
            </div>

            {/* Method switch tabs */}
            {step === "input" && (
              <div className="flex rounded-xl bg-secondary/80 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("phone");
                    setError("");
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === "phone"
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-neutral-500 hover:text-foreground"
                  }`}
                >
                  Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("email");
                    setError("");
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authMethod === "email"
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-neutral-500 hover:text-foreground"
                  }`}
                >
                  Email & Password
                </button>
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOtpOrLogin} className="space-y-3">
              {step === "input" ? (
                <>
                  {tab === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full min-h-[44px] rounded-xl border border-border bg-card pl-10 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                        />
                      </div>
                    </div>
                  )}

                  {authMethod === "phone" ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Mobile Number</label>
                      <div className="flex items-center rounded-xl border border-border bg-card focus-within:border-[#B0CB1F] focus-within:ring-1 focus-within:ring-[#B0CB1F] overflow-hidden">
                        <span className="px-3.5 py-2.5 text-xs font-bold text-neutral-500 border-r border-border bg-secondary/40">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full min-h-[44px] bg-transparent px-3 py-2 text-xs text-foreground outline-none font-medium"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full min-h-[44px] rounded-xl border border-border bg-card pl-10 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full min-h-[44px] rounded-xl border border-border bg-card pl-10 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[46px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <span>{authMethod === "phone" ? "Continue" : tab === "login" ? "Sign In" : "Create Account"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* OTP STEP */
                <div className="space-y-4 pt-1">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className="h-12 w-12 rounded-xl border-2 border-border bg-card text-center font-display text-xl font-black text-foreground outline-none focus:border-[#B0CB1F] focus:ring-2 focus:ring-[#B0CB1F]/30"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[46px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <div className="flex justify-between items-center text-xs text-neutral-500 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep("input")}
                      className="hover:underline cursor-pointer"
                    >
                      ← Change number
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(["", "", "", ""]);
                        setError("New OTP sent via SMS!");
                      }}
                      className="text-[#5b6a07] dark:text-[#B0CB1F] font-bold hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Toggle Login / Signup */}
            {step === "input" && (
              <div className="pt-2 text-center text-xs text-neutral-500">
                {tab === "login" ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("signup");
                        setError("");
                      }}
                      className="font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setTab("login");
                        setError("");
                      }}
                      className="font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* Trust note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Safe & Secure 256-Bit Encrypted Login</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
