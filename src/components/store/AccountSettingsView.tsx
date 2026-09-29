import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Mail, Phone, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { changeCustomerPassword, updateCustomerProfile } from "@/lib/customer-account";

const inputClass =
  "w-full min-h-[44px] rounded-xl border border-border bg-card pl-10 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]";
const labelClass = "text-[11px] font-bold text-neutral-600 dark:text-neutral-400";
const submitClass =
  "w-full min-h-[46px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide shadow-[0_4px_16px_rgba(176,203,31,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all disabled:opacity-60";

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong. Please try again.";

function ViewHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/10">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to account"
        className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h3 className="font-display font-black text-sm text-foreground">{title}</h3>
    </div>
  );
}

function Notice({ error, success }: { error: string; success: string }) {
  if (error) {
    return (
      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
        {error}
      </div>
    );
  }
  if (success) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#B0CB1F]/15 border border-[#B0CB1F]/40 text-xs font-semibold text-[#5b6a07] dark:text-[#B0CB1F]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        {success}
      </div>
    );
  }
  return null;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          id={id}
          type="password"
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
    </div>
  );
}

/** Edit name and mobile number. Email is shown read-only — it can't be changed. */
export function EditProfileView({ onBack }: { onBack: () => void }) {
  const { userProfile, loginUser } = useCart();
  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState((userProfile?.phone || "").replace(/\D/g, "").slice(-10));
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!userProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) return setError("Please enter your full name");
    if (phone.length !== 10) return setError("Please enter a valid 10-digit mobile number");
    if (!currentPassword) return setError("Please enter your password to confirm");

    setIsSaving(true);
    try {
      const account = await updateCustomerProfile({
        email: userProfile.email,
        currentPassword,
        name: name.trim(),
        phone,
      });
      loginUser({ ...userProfile, name: account.name, phone: account.phone });
      setCurrentPassword("");
      setSuccess("Your details have been updated.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      <ViewHeader title="Edit Profile" onBack={onBack} />
      <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3 overflow-y-auto">
        <Notice error={error} success={success} />

        <div className="space-y-1">
          <label htmlFor="profile-name" className={labelClass}>
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="profile-phone" className={labelClass}>
            Mobile Number
          </label>
          <div className="flex items-center rounded-xl border border-border bg-card focus-within:border-[#B0CB1F] focus-within:ring-1 focus-within:ring-[#B0CB1F] overflow-hidden">
            <span className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-neutral-500 border-r border-border bg-secondary/40">
              <Phone className="h-3.5 w-3.5" />
              +91
            </span>
            <input
              id="profile-phone"
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
        </div>

        <div className="space-y-1">
          <label htmlFor="profile-email" className={labelClass}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="profile-email"
              type="email"
              value={userProfile.email}
              readOnly
              disabled
              className={`${inputClass} bg-secondary/40 text-neutral-500 cursor-not-allowed`}
            />
          </div>
          <p className="text-[10.5px] text-neutral-500">Email address can't be changed.</p>
        </div>

        <PasswordField
          id="profile-password"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          placeholder="Enter your password to confirm"
        />

        <button type="submit" disabled={isSaving} className={submitClass}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

/** Change password — requires the current one. */
export function ChangePasswordView({ onBack }: { onBack: () => void }) {
  const { userProfile } = useCart();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!userProfile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) return setError("Please enter your current password");
    if (newPassword.length < 6) return setError("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return setError("New passwords don't match");
    if (newPassword === currentPassword)
      return setError("New password must be different from the current one");

    setIsSaving(true);
    try {
      await changeCustomerPassword({ email: userProfile.email, currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been changed.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      <ViewHeader title="Change Password" onBack={onBack} />
      <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3 overflow-y-auto">
        <Notice error={error} success={success} />
        <PasswordField
          id="password-current"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <PasswordField
          id="password-new"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
        <PasswordField
          id="password-confirm"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          placeholder="Re-enter new password"
        />
        <button type="submit" disabled={isSaving} className={submitClass}>
          {isSaving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
