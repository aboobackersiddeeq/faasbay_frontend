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
  UserCog,
  KeyRound,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import faasbayLogo from "@/assets/faasbay-logo.png";
import { MyOrdersView } from "./MyOrdersView";
import { MyAddressesView } from "./MyAddressesView";
import { ChangePasswordView, EditProfileView } from "./AccountSettingsView";
import { loginCustomer, registerCustomer } from "@/lib/customer-account";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "password" | "identifier", string>>;

const inputClass =
  "w-full min-h-[44px] rounded-xl border bg-card pl-10 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]";

export function AuthModal() {
  const {
    isAuthOpen,
    closeAuthModal,
    userProfile,
    loginUser,
    logoutUser,
    accountView: view,
    setAccountView: setView,
  } = useCart();
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthOpen) return null;

  const switchTab = (next: "login" | "signup") => {
    setTab(next);
    setError("");
    setFieldErrors({});
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (tab === "signup") {
      if (name.trim().length < 2) errors.name = "Please enter your full name";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Please enter a valid email address";
      if (phone.replace(/\D/g, "").length !== 10) errors.phone = "Please enter a valid 10-digit mobile number";
    } else if (!identifier.trim()) {
      errors.identifier = "Please enter your email or mobile number";
    }
    if (password.length < 6) errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setIsLoading(true);
    try {
      const account =
        tab === "signup"
          ? await registerCustomer({
              name: name.trim(),
              email: email.trim(),
              phone: phone.replace(/\D/g, ""),
              password,
            })
          : await loginCustomer(identifier.trim(), password);

      loginUser({
        name: account.name,
        email: account.email,
        phone: account.phone,
        address: account.address,
        city: account.city,
        pincode: account.pincode,
        state: account.state,
      });
      setPassword("");
      closeAuthModal();
    } catch (err) {
      // A duplicate email/phone is reported under the field it clashes with.
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      if (tab === "signup" && /email/i.test(message)) setFieldErrors({ email: message });
      else if (tab === "signup" && /mobile/i.test(message)) setFieldErrors({ phone: message });
      else setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (key: keyof FieldErrors) =>
    fieldErrors[key] ? (
      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{fieldErrors[key]}</p>
    ) : null;
  const borderFor = (key: keyof FieldErrors) => (fieldErrors[key] ? "border-rose-400" : "border-border");

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
            onClick={() => {
              closeAuthModal();
              setView("menu");
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* LOGGED IN ACCOUNT VIEW */}
        {userProfile ? (
          view === "orders" ? (
            <MyOrdersView phone={userProfile.phone} email={userProfile.email} onBack={() => setView("menu")} />
          ) : view === "addresses" ? (
            <MyAddressesView phone={userProfile.phone} email={userProfile.email} onBack={() => setView("menu")} />
          ) : view === "profile" ? (
            <EditProfileView onBack={() => setView("menu")} />
          ) : view === "password" ? (
            <ChangePasswordView onBack={() => setView("menu")} />
          ) : (
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
                onClick={() => setView("profile")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-secondary/40 transition-colors text-left text-xs font-bold text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-foreground">
                    <UserCog className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block">Edit Profile</span>
                    <span className="text-[10.5px] font-normal text-neutral-500">Update your name and mobile number</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={() => setView("password")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-secondary/40 transition-colors text-left text-xs font-bold text-foreground cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block">Change Password</span>
                    <span className="text-[10.5px] font-normal text-neutral-500">Keep your account secure</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
              </button>
              <button
                type="button"
                onClick={() => setView("orders")}
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
                onClick={() => setView("addresses")}
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
                setView("menu");
              }}
              className="w-full min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100/60 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
          )
        ) : (
          /* AUTH LOGIN / SIGNUP FORM */
          <div className="p-6 space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="font-display text-xl font-black text-foreground">
                {tab === "login" ? "Welcome Back to FaasBay" : "Create FaasBay Account"}
              </h3>
              <p className="text-xs text-neutral-500">
                Log in to track orders, manage addresses, and checkout faster.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {tab === "signup" ? (
                <>
                  <div className="space-y-1">
                    <label htmlFor="auth-name" className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className={`${inputClass} ${borderFor("name")}`}
                      />
                    </div>
                    {fieldError("name")}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="auth-email" className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        id="auth-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={`${inputClass} ${borderFor("email")}`}
                      />
                    </div>
                    {fieldError("email")}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="auth-phone" className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                      Mobile Number
                    </label>
                    <div
                      className={`flex items-center rounded-xl border bg-card focus-within:border-[#B0CB1F] focus-within:ring-1 focus-within:ring-[#B0CB1F] overflow-hidden ${borderFor("phone")}`}
                    >
                      <span className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-neutral-500 border-r border-border bg-secondary/40">
                        <Phone className="h-3.5 w-3.5" />
                        +91
                      </span>
                      <input
                        id="auth-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="98765 43210"
                        className="w-full min-h-[44px] bg-transparent px-3 py-2 text-xs text-foreground outline-none font-medium"
                      />
                    </div>
                    {fieldError("phone")}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label htmlFor="auth-identifier" className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                    Email or Mobile Number
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      id="auth-identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@example.com or 98765 43210"
                      className={`${inputClass} ${borderFor("identifier")}`}
                    />
                  </div>
                  {fieldError("identifier")}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-password" className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"}
                    className={`${inputClass} ${borderFor("password")}`}
                  />
                </div>
                {fieldError("password")}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[46px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <span>{tab === "login" ? "Signing In..." : "Creating Account..."}</span>
                ) : (
                  <>
                    <span>{tab === "login" ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Login / Signup */}
            <div className="pt-2 text-center text-xs text-neutral-500">
              {tab === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
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
                    onClick={() => switchTab("login")}
                    className="font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>

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
