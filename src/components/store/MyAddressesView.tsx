import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Plus, Trash2, RefreshCw, Loader2, Phone } from "lucide-react";
import { fetchMyAddresses, addMyAddress, deleteMyAddress, type SavedAddress } from "@/lib/customer-account";

interface MyAddressesViewProps {
  phone?: string;
  email?: string;
  onBack: () => void;
}

const emptyForm = { name: "", phone: "", street: "", city: "", state: "", pincode: "" };

export function MyAddressesView({ phone, email, onBack }: MyAddressesViewProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError("");
    fetchMyAddresses(phone, email)
      .then(setAddresses)
      .catch(() => setError("Could not load your saved addresses. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, email]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      setFormError("Street, city and pincode are required.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setFormError("Please enter a valid 6-digit pincode.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await addMyAddress(
        { phone, email },
        {
          name: form.name.trim() || undefined,
          phone: form.phone.trim() || phone || undefined,
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim() || undefined,
          pincode: form.pincode.trim(),
        }
      );
      setAddresses(updated);
      setForm(emptyForm);
      setIsAdding(false);
    } catch {
      setFormError("Could not save this address. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const updated = await deleteMyAddress({ phone, email }, id);
      setAddresses(updated);
    } catch {
      setError("Could not remove this address. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to account"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-display font-black text-sm text-foreground">Saved Delivery Addresses</h3>
      </div>

      <div className="p-5 space-y-3 overflow-y-auto">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-secondary/60 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs font-semibold text-rose-500">{error}</p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5b6a07] dark:text-[#B0CB1F] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && addresses.length === 0 && !isAdding && (
          <div className="text-center py-8 space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-neutral-400">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-foreground">No saved addresses yet</p>
            <p className="text-[11px] text-neutral-500">Add one for faster, 1-tap checkout.</p>
          </div>
        )}

        {!isLoading &&
          !error &&
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                {addr.name && <p className="text-xs font-bold text-foreground">{addr.name}</p>}
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                </p>
                {addr.phone && (
                  <p className="text-[10.5px] text-neutral-400 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {addr.phone}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                disabled={deletingId === addr.id}
                aria-label="Remove address"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingId === addr.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}

        {!isLoading && isAdding && (
          <form onSubmit={handleAdd} className="space-y-2.5 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
            {formError && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {formError}
              </div>
            )}
            <input
              type="text"
              placeholder="Full Name (optional)"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
            />
            <input
              type="tel"
              placeholder="Contact Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
            />
            <input
              type="text"
              required
              placeholder="Street Address / House No."
              value={form.street}
              onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
              className="w-full min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
              />
              <input
                type="text"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
              />
            </div>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/[^0-9]/g, "") }))}
              className="w-full min-h-[38px] rounded-lg border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setForm(emptyForm);
                  setFormError("");
                }}
                className="flex-1 min-h-[38px] rounded-lg border border-border text-xs font-bold text-foreground hover:bg-secondary active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 min-h-[38px] rounded-lg bg-[#B0CB1F] hover:bg-[#9cb519] text-slate-950 text-xs font-black active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Address"}
              </button>
            </div>
          </form>
        )}

        {!isLoading && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full min-h-[46px] rounded-2xl border border-dashed border-border hover:border-[#B0CB1F] bg-secondary/30 hover:bg-secondary/60 text-foreground text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        )}
      </div>
    </div>
  );
}
