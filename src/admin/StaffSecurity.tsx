import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, Key, Clock, AlertTriangle, User, UserPlus, Activity, X, Check, Eye, EyeOff, Lock } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, ConfirmDialog, Btn, FormField, Input, Select, Toggle, Card, KPICard, TabSwitcher } from "./shared/components";
import type { AdminStaff, AdminRole, AdminAuditLog } from "./shared/types";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// ── Staff ───────────────────────────────────────────────────────────────────

const presetRoles = [
  "Super Admin",
  "Store Manager",
  "Operations Manager",
  "Order & Fulfillment",
  "Inventory Manager",
  "Marketing Manager",
  "Finance",
  "Customer Support",
  "Content Manager",
];

const initStaff: AdminStaff[] = [
  { id: "st-1", name: "FaasBay Super Admin", email: "ecom@faasbay.com", phone: "+91 98468 88212", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", role: "Super Admin", status: "Active", lastLogin: "Just now", createdAt: "2026-01-01", permissions: ["all"] },
];

/**
 * Lets the signed-in staff member change their own password.
 *
 * The current password is verified server-side against the stored bcrypt hash, so
 * an unattended open session cannot be used to take the account over.
 */
function ChangeMyPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("The new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The two new passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.post(`${API_BASE_URL}/api/auth/admin/change-password`, { currentPassword, newPassword });
      toast.success("Your password has been changed.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Could not change your password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Lock size={13} className="text-slate-400" /> Change my password
        </span>
        <span className="text-[11px] text-slate-400">{open ? "Hide" : "Open"}</span>
      </button>

      {open && (
        <form onSubmit={submit} className="grid gap-3 border-t border-slate-100 px-4 py-4 sm:grid-cols-3">
          <FormField label="Current password">
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </FormField>
          <FormField label="New password">
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormField>
          <FormField label="Confirm new password">
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormField>
          <div className="sm:col-span-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">At least 8 characters. Stored only as a bcrypt hash.</p>
            <Btn type="submit" disabled={saving || !currentPassword || !newPassword}>
              {saving ? "Saving…" : "Update password"}
            </Btn>
          </div>
        </form>
      )}
    </div>
  );
}

export function StaffPage() {
  // Staff accounts live in MongoDB. Passwords are bcrypt-hashed server-side and
  // are never returned by the API, so none is ever held in the browser.
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminStaff[]>(API_ENDPOINTS.staff);
      setStaff(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);
  const [edit, setEdit] = useState<AdminStaff | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Order & Fulfillment"]);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [availableRolesList, setAvailableRolesList] = useState<string[]>(presetRoles);
  const [deleteTarget, setDeleteTarget] = useState<AdminStaff | null>(null);

  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (edit) {
      setEdit({ ...edit, password: pass });
      setShowPassword(true);
    }
  };

  const openAddModal = () => {
    setFormSessionKey(Math.random().toString(36).substring(2, 9));
    setEdit({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "Order & Fulfillment",
      status: "Active",
      createdAt: "",
      permissions: [],
    });
    setSelectedRoles(["Order & Fulfillment"]);
    setCustomRoleInput("");
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (s: AdminStaff) => {
    setFormSessionKey(Math.random().toString(36).substring(2, 9));
    setEdit({ ...s, password: s.password || "" });
    setShowPassword(false);
    const currentRoles = s.role ? s.role.split(",").map((r) => r.trim()).filter(Boolean) : ["Order & Fulfillment"];
    setSelectedRoles(currentRoles);
    // Add any unique roles from this staff to available list
    currentRoles.forEach((r) => {
      if (!availableRolesList.includes(r)) {
        setAvailableRolesList((prev) => [...prev, r]);
      }
    });
    setCustomRoleInput("");
    setModalOpen(true);
  };

  const toggleRole = (r: string) => {
    if (selectedRoles.includes(r)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((item) => item !== r));
      }
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const handleAddCustomRole = () => {
    if (!customRoleInput.trim()) return;
    const trimmed = customRoleInput.trim();
    if (!availableRolesList.includes(trimmed)) {
      setAvailableRolesList([...availableRolesList, trimmed]);
    }
    if (!selectedRoles.includes(trimmed)) {
      setSelectedRoles([...selectedRoles, trimmed]);
    }
    setCustomRoleInput("");
  };

  const save = async () => {
    if (!edit || !edit.name.trim() || !edit.email.trim()) return;
    const combinedRole = selectedRoles.join(", ") || "Staff Member";

    const idx = staff.findIndex((s) => s.id === edit.id);

    // The API never returns password hashes, so an untouched field means
    // "leave the existing password alone" — send nothing rather than a blank.
    const typedPassword = edit.password ? edit.password.trim() : "";

    const staffData: AdminStaff = { ...edit, role: combinedRole };
    if (typedPassword) {
      staffData.password = typedPassword;
    } else {
      delete staffData.password;
    }

    if (typedPassword && typedPassword.length < 8) {
      toast.error("The password must be at least 8 characters.");
      return;
    }

    try {
      if (idx >= 0) {
        await api.put(`${API_ENDPOINTS.staff}/${encodeURIComponent(staffData.id)}`, staffData);
      } else {
        await api.post(API_ENDPOINTS.staff, {
          ...staffData,
          id: `st-${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
          avatar: edit.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        });
      }
      await loadStaff();
      setModalOpen(false);
      setEdit(null);
      toast.success(idx >= 0 ? "Staff account updated." : "Staff account created.");
    } catch (e: any) {
      toast.error(e?.message || "Could not save the staff account.");
    }
  };

  const deleteStaff = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`${API_ENDPOINTS.staff}/${encodeURIComponent(target.id)}`);
      await loadStaff();
      toast.success(`Removed ${target.name}.`);
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the staff account.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Staff Member",
      render: (s: AdminStaff) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            {s.avatar ? (
              <img src={s.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                {s.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">{s.name}</div>
            <div className="text-[10px] text-slate-400">{s.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Assigned Roles",
      render: (s: AdminStaff) => {
        const roles = s.role ? s.role.split(",").map((r) => r.trim()).filter(Boolean) : [s.role || "Staff"];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200/80"
              >
                {r}
              </span>
            ))}
          </div>
        );
      },
    },
    { key: "status", label: "Status", render: (s: AdminStaff) => <StatusBadge status={s.status} size="xs" /> },
    { key: "lastLogin", label: "Last Login", render: (s: AdminStaff) => <span className="text-xs text-slate-500">{s.lastLogin || "Never"}</span> },
    { key: "createdAt", label: "Added", render: (s: AdminStaff) => <span className="text-xs text-slate-500">{s.createdAt}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Members"
        subtitle={loading ? "Loading…" : `${staff.length} team members`}
        breadcrumbs={[{ label: "Staff & Security" }, { label: "Staff" }]}
        actions={
          <Btn icon={<UserPlus size={13} />} onClick={openAddModal}>
            Add Staff
          </Btn>
        }
      />
      <ChangeMyPassword />
      <DataTable
        columns={columns}
        data={staff}
        keyField="id"
        actions={(s: AdminStaff) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditModal(s)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Edit Staff"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setDeleteTarget(s)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Staff"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.email})? They will immediately lose access to the admin portal.`}
        confirmLabel="Delete Staff"
        destructive
      />

      {/* ── Apple-Glass Centered Pop-up Modal ── */}
      {modalOpen && edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/80 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {edit.id && staff.find((s) => s.id === edit.id) ? "Edit Staff Member" : "Add Staff Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign contact info and multiple access roles to this team member.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEdit(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form
              key={formSessionKey || "modal-form"}
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              className="space-y-4"
            >
              {/* Invisible trap fields to consume aggressive browser autofill */}
              <div style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none", zIndex: -1 }} tabIndex={-1} aria-hidden="true">
                <input type="text" name="autofill_honeypot_user" tabIndex={-1} autoComplete="off" />
                <input type="password" name="autofill_honeypot_pass" tabIndex={-1} autoComplete="new-password" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={`stf_name_${formSessionKey}`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="e.g. Rahul Sharma"
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="email"
                    name={`stf_email_${formSessionKey}`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="e.g. rahul@faasbay.com"
                    value={edit.email}
                    onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    inputMode="tel"
                    name={`stf_phone_${formSessionKey}`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="e.g. +91 98765 43210"
                    value={edit.phone || ""}
                    onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Account Status</label>
                  <select
                    value={edit.status}
                    onChange={(e) => setEdit({ ...edit, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Login Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <span>Login Password</span>
                    {!edit.id && <span className="text-rose-500">*</span>}
                    {edit.id && <span className="text-[10px] text-slate-400 font-normal">(leave blank to keep unchanged)</span>}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10.5px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <Key size={10} />
                    <span>Generate Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name={`stf_password_${formSessionKey}`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute("readOnly")}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    placeholder={edit.id ? "•••••••••••• (Unchanged)" : "Set login password (min 6 characters)"}
                    value={edit.password || ""}
                    onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                    style={{
                      WebkitTextSecurity: showPassword ? "none" : "disc",
                      textSecurity: showPassword ? "none" : "disc",
                    } as any}
                    className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* ── Multi-Role Assignment Section ── */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Assigned Roles ({selectedRoles.length} selected)
                  </label>
                  <span className="text-[11px] text-slate-400">Select one or multiple</span>
                </div>

                {/* Role Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  {availableRolesList.map((r) => {
                    const isSelected = selectedRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Role Field */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Create custom role (e.g. Lead Merchandiser)"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRole}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    + Add Role
                  </button>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                {edit.id && staff.some((s) => s.id === edit.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = edit;
                      setModalOpen(false);
                      setEdit(null);
                      setDeleteTarget(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Staff</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEdit(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!edit.name.trim() || !edit.email.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Save Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Roles & Permissions ──────────────────────────────────────────────────────

const initRoles: AdminRole[] = [
  { id: "role-owner", name: "Owner", description: "Full access to everything", permissions: { products: ["view", "create", "edit", "delete", "publish"], orders: ["view", "edit", "cancel", "refund", "fulfill"], customers: ["view", "edit", "export"], coupons: ["view", "create", "edit", "delete"], storefront: ["view", "edit", "publish"], finance: ["view", "export"], settings: ["view", "edit"], staff: ["view", "create", "edit", "delete"] }, staffCount: 1, isSystem: true },
  { id: "role-manager", name: "Store Manager", description: "Products, orders, and inventory", permissions: { products: ["view", "create", "edit"], orders: ["view", "edit", "fulfill"], customers: ["view"], coupons: ["view", "create", "edit"], storefront: ["view"], finance: ["view"], settings: ["view"], staff: ["view"] }, staffCount: 1, isSystem: true },
  { id: "role-fulfillment", name: "Order & Fulfillment", description: "Orders, shipping, and returns", permissions: { orders: ["view", "edit", "fulfill"], customers: ["view"] }, staffCount: 1, isSystem: true },
  { id: "role-marketing", name: "Marketing Manager", description: "Coupons, promotions, and content", permissions: { coupons: ["view", "create", "edit", "delete"], storefront: ["view", "edit", "publish"], customers: ["view"] }, staffCount: 0, isSystem: true },
  { id: "role-support", name: "Customer Support", description: "Tickets, reviews, and customer info", permissions: { orders: ["view"], customers: ["view"], storefront: ["view"] }, staffCount: 0, isSystem: true },
  { id: "role-finance", name: "Finance", description: "Revenue, invoices, and tax reports", permissions: { finance: ["view", "export"], orders: ["view"] }, staffCount: 0, isSystem: true },
];

export function RolesPage() {
  const permModules = ["products", "orders", "customers", "coupons", "storefront", "finance", "settings", "staff"];
  const permActions = ["view", "create", "edit", "delete", "publish", "export", "fulfill", "cancel", "refund"];
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle={`${initRoles.length} roles configured`} breadcrumbs={[{ label: "Staff & Security" }, { label: "Roles" }]} actions={<Btn icon={<Plus size={13} />}>Create Role</Btn>} />
      <div className="space-y-3">
        {initRoles.map(role => (
          <Card key={role.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div><div className="text-sm font-semibold text-gray-900">{role.name}</div><div className="text-xs text-gray-500">{role.description}</div></div>
              <div className="flex items-center gap-2"><span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{role.staffCount} staff</span>{role.isSystem && <span className="text-[10px] text-gray-400">System</span>}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(role.permissions).map(([mod, actions]) => (
                <span key={mod} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">{mod}: {(actions as string[]).join(", ")}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Audit Logs ──────────────────────────────────────────────────────────────

const initAuditLogs: AdminAuditLog[] = [];

export function AuditLogsPage() {
  const columns = [
    { key: "timestamp", label: "Time", render: (l: AdminAuditLog) => <span className="text-xs text-gray-500">{l.timestamp}</span> },
    { key: "user", label: "User", render: (l: AdminAuditLog) => (<div><div className="text-xs text-gray-900">{l.user}</div><div className="text-[10px] text-gray-400">{l.role}</div></div>) },
    { key: "action", label: "Action", render: (l: AdminAuditLog) => <span className="text-[11px] font-mono text-gray-700">{l.action}</span> },
    { key: "module", label: "Module", render: (l: AdminAuditLog) => <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{l.module}</span> },
    { key: "details", label: "Details", width: "35%", render: (l: AdminAuditLog) => (<div><div className="text-xs text-gray-700">{l.details}</div>{l.previousValue && l.newValue && <div className="text-[10px] text-gray-400 mt-0.5"><span className="line-through">{l.previousValue}</span> → <span className="text-emerald-600">{l.newValue}</span></div>}</div>) },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle={`${initAuditLogs.length} activity logs`} breadcrumbs={[{ label: "Staff & Security" }, { label: "Audit Logs" }]} />
      <DataTable columns={columns} data={initAuditLogs} keyField="id" searchPlaceholder="Search audit logs..." pageSize={10} />
    </div>
  );
}

// ── Security ────────────────────────────────────────────────────────────────

export function SecurityPage() {
  const loginHistory = [
    { user: "FaasBay Super Admin", time: "Just now", ip: "127.0.0.1", device: "Browser / Admin Session", status: "Success" },
  ];

  return (
    <div>
      <PageHeader title="Security" subtitle="Login history and session management" breadcrumbs={[{ label: "Staff & Security" }, { label: "Security" }]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Active Sessions" value="1" icon={<User size={14} />} />
        <KPICard title="Failed Attempts" value="0" />
        <KPICard title="Security Status" value="Healthy" />
        <KPICard title="Protected Access" value="Enabled" />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider"><th className="text-left px-4 py-2.5 font-medium">User</th><th className="text-left px-3 py-2.5 font-medium">Time</th><th className="text-left px-3 py-2.5 font-medium">IP</th><th className="text-left px-3 py-2.5 font-medium">Device</th><th className="text-left px-3 py-2.5 font-medium">Status</th></tr></thead>
          <tbody>{loginHistory.map((l, i) => (
            <tr key={i} className="border-b border-gray-50"><td className="px-4 py-2.5 text-xs text-gray-900">{l.user}</td><td className="px-3 py-2.5 text-xs text-gray-500">{l.time}</td><td className="px-3 py-2.5 text-xs font-mono text-gray-500">{l.ip}</td><td className="px-3 py-2.5 text-xs text-gray-500">{l.device}</td><td className="px-3 py-2.5"><StatusBadge status={l.status === "Success" ? "Active" : "Failed"} size="xs" /></td></tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Master Staff & Security View with Sub-Navigation ───────────────────────

export default function StaffSecurityMasterView({
  initialTab = "staff",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string;
  initialSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}) {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subTab");
      if (sub) return sub;
    }
    return initialSubTab || initialTab || "staff";
  });

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    onSubTabChange?.(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("faasbay_admin_sub_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="space-y-4">
      <TabSwitcher
        tabs={[
          { key: "staff", label: "Staff Members", count: 1 },
          { key: "roles", label: "Roles & Permissions", count: initRoles.length },
          { key: "audit_logs", label: "Activity Audit Logs", count: initAuditLogs.length },
          { key: "security", label: "Security & Sessions" },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "staff" && <StaffPage />}
      {tab === "roles" && <RolesPage />}
      {tab === "audit_logs" && <AuditLogsPage />}
      {tab === "security" && <SecurityPage />}
    </div>
  );
}

