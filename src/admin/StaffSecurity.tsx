import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  Key,
  AlertTriangle,
  User,
  UserPlus,
  X,
  Check,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  DataTable,
  StatusBadge,
  PageHeader,
  ConfirmDialog,
  Btn,
  FormField,
  Input,
  Card,
  KPICard,
  TabSwitcher,
  Modal,
  EmptyState,
} from "./shared/components";
import type {
  AdminStaff,
  AdminRole,
  AdminAuditLog,
  AdminAccess,
  PermissionCatalog,
} from "./shared/types";
import { API_ENDPOINTS } from "@/config/api";
import { api, apiRequestRaw } from "@/lib/api-client";
import { getAdminUser, replaceAdminToken, type AdminUser } from "@/lib/admin-session";
import { toast } from "sonner";

// ── Shared helpers ─────────────────────────────────────────────────────────

const SUPER_ADMIN = "Super Admin";
const MIN_PASSWORD = 8;

const splitRoles = (role?: string) =>
  role
    ? role
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

const errorMessage = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

function canDo(access: AdminAccess | null, module: string, action: string) {
  if (!access) return false;
  return access.superAdmin || (access.permissions[module] || []).includes(action);
}

/** ISO → "5 min ago" / "Sep 3, 2026, 4:12 PM"; legacy free-text values pass through. */
function formatWhen(value?: string | null, relative = true) {
  if (!value) return "Never";
  const date = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}/.test(value) || Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  if (relative && diff >= 0 && diff < 7 * 86400000) {
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Cryptographically random password that always mixes character classes. */
function generateStrongPassword(length = 14) {
  const sets = ["abcdefghjkmnpqrstuvwxyz", "ABCDEFGHJKLMNPQRSTUVWXYZ", "23456789", "!@#$%&*?"];
  const all = sets.join("");
  const random = (max: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! % max;
  };
  const chars = sets.map((s) => s[random(s.length)]!);
  while (chars.length < length) chars.push(all[random(all.length)]!);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

function Badge({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "emerald" | "rose" | "amber" | "blue";
  children: React.ReactNode;
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded-md font-medium border whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function useRoles() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await apiRequestRaw<{ data: AdminRole[]; catalog: PermissionCatalog }>(
        API_ENDPOINTS.roles,
      );
      setRoles(Array.isArray(res.data) ? res.data : []);
      setCatalog(res.catalog || {});
    } catch (e) {
      toast.error(errorMessage(e, "Could not load roles."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { roles, catalog, loading, reload: load };
}

interface SectionProps {
  access: AdminAccess | null;
  me: AdminUser | null;
  onCount?: (n: number) => void;
}

// ── Staff ───────────────────────────────────────────────────────────────────

/**
 * Lets the signed-in staff member change their own password.
 *
 * The current password is verified server-side against the stored bcrypt hash, so
 * an unattended open session cannot be used to take the account over. Every other
 * session is signed out; this browser receives a fresh token.
 */
function ChangeMyPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD) {
      toast.error(`The new password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The two new passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequestRaw<{ token?: string; user?: AdminUser }>(
        API_ENDPOINTS.changePassword,
        {
          method: "POST",
          body: { currentPassword, newPassword },
        },
      );
      if (res.token) replaceAdminToken(res.token, res.user);
      toast.success("Password changed. Your other sessions have been signed out.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Lock size={13} className="text-slate-400" /> Change my password
        </span>
        <span className="text-[11px] text-slate-400">{open ? "Hide" : "Open"}</span>
      </button>

      {open && (
        <form
          onSubmit={submit}
          className="grid gap-3 border-t border-slate-100 px-4 py-4 sm:grid-cols-3"
        >
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
            <p className="text-[11px] text-slate-400">
              At least {MIN_PASSWORD} characters. Signs out your other sessions.
            </p>
            <Btn type="submit" disabled={saving || !currentPassword || !newPassword}>
              {saving ? "Saving…" : "Update password"}
            </Btn>
          </div>
        </form>
      )}
    </div>
  );
}

const staffInputClass =
  "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400";

/** Props that stop password managers from hijacking the staff form. */
const noAutofill = (key: string, name: string) => ({
  name: `stf_${name}_${key}`,
  autoComplete: "off",
  autoCorrect: "off",
  spellCheck: false,
  readOnly: true,
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.removeAttribute("readOnly"),
  "data-lpignore": "true",
  "data-1p-ignore": "true",
});

export function StaffPage({
  access,
  me,
  onCount,
  onManageRoles,
}: SectionProps & { onManageRoles?: () => void }) {
  // Staff accounts live in MongoDB. Passwords are bcrypt-hashed server-side and
  // are never returned by the API, so none is ever held in the browser.
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useRoles();

  const loadStaff = useCallback(async () => {
    try {
      const rows = await api.get<AdminStaff[]>(API_ENDPOINTS.staff);
      const list = Array.isArray(rows) ? rows : [];
      setStaff(list);
      onCount?.(list.length);
    } catch (e) {
      toast.error(errorMessage(e, "Could not load staff accounts."));
    } finally {
      setLoading(false);
    }
  }, [onCount]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const [edit, setEdit] = useState<AdminStaff | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSessionKey, setFormSessionKey] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminStaff | null>(null);

  const isSuper = !!access?.superAdmin;
  const canCreate = canDo(access, "staff", "create");
  const canEdit = canDo(access, "staff", "edit");
  const canDelete = canDo(access, "staff", "delete");
  const isNew = !!edit && !staff.some((s) => s.id === edit.id);
  const editingSelf = !!edit && !isNew && edit.id === me?.id;
  const targetIsSuper = (s: AdminStaff) =>
    splitRoles(s.role).includes(SUPER_ADMIN) || (s.permissions || []).includes("all");

  const closeModal = () => {
    setModalOpen(false);
    setEdit(null);
  };

  const openAddModal = () => {
    const defaultRole =
      roles.find((r) => r.name === "Order & Fulfillment")?.name ||
      roles.find((r) => r.name !== SUPER_ADMIN)?.name ||
      "";
    setFormSessionKey(Math.random().toString(36).substring(2, 9));
    setEdit({
      id: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      role: defaultRole,
      status: "Active",
      createdAt: "",
      permissions: [],
    });
    setSelectedRoles(defaultRole ? [defaultRole] : []);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (s: AdminStaff) => {
    setFormSessionKey(Math.random().toString(36).substring(2, 9));
    setEdit({ ...s, password: "" });
    setSelectedRoles(splitRoles(s.role));
    setShowPassword(false);
    setModalOpen(true);
  };

  const toggleRole = (r: string) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? (prev.length > 1 ? prev.filter((x) => x !== r) : prev) : [...prev, r],
    );
  };

  const save = async () => {
    if (!edit || !edit.name.trim() || !edit.email.trim()) return;
    if (!selectedRoles.length) {
      toast.error("Assign at least one role.");
      return;
    }

    // The API never returns password hashes, so an untouched field means
    // "leave the existing password alone" — send nothing rather than a blank.
    const typedPassword = edit.password ? edit.password.trim() : "";
    if (isNew && !typedPassword) {
      toast.error("Set a login password for the new staff member.");
      return;
    }
    if (typedPassword && typedPassword.length < MIN_PASSWORD) {
      toast.error(`The password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    const payload: Record<string, unknown> = {
      name: edit.name.trim(),
      email: edit.email.trim(),
      phone: edit.phone?.trim() || "",
      status: edit.status,
      role: selectedRoles.join(", "),
    };
    if (typedPassword) payload["password"] = typedPassword;

    setSaving(true);
    try {
      if (isNew) {
        await api.post(API_ENDPOINTS.staff, {
          ...payload,
          avatar:
            edit.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        });
      } else {
        await api.put(`${API_ENDPOINTS.staff}/${encodeURIComponent(edit.id)}`, payload);
      }
      await loadStaff();
      closeModal();
      toast.success(
        isNew
          ? "Staff account created."
          : typedPassword
            ? "Staff account updated — their existing sessions were signed out."
            : "Staff account updated.",
      );
    } catch (e) {
      toast.error(errorMessage(e, "Could not save the staff account."));
    } finally {
      setSaving(false);
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
    } catch (e) {
      toast.error(errorMessage(e, "Could not delete the staff account."));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Staff Member",
      render: (s: AdminStaff) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
            {s.avatar ? (
              <img src={s.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                {s.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              {s.name}
              {s.id === me?.id && <Badge tone="blue">You</Badge>}
            </div>
            <div className="text-[10px] text-slate-400">{s.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Assigned Roles",
      render: (s: AdminStaff) => (
        <div className="flex flex-wrap gap-1">
          {splitRoles(s.role).map((r) => (
            <Badge key={r} tone={r === SUPER_ADMIN ? "amber" : "slate"}>
              {r === SUPER_ADMIN && <Shield size={9} />}
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s: AdminStaff) => (
        <div className="flex items-center gap-1">
          <StatusBadge status={s.status} size="xs" />
          {s.lockedUntil && new Date(s.lockedUntil) > new Date() && (
            <Badge tone="rose">
              <Lock size={9} /> Locked
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (s: AdminStaff) => (
        <span className="text-xs text-slate-500" title={s.lastLogin}>
          {formatWhen(s.lastLogin)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Added",
      render: (s: AdminStaff) => (
        <span className="text-xs text-slate-500">{s.createdAt || "—"}</span>
      ),
    },
  ];

  const lockedForMe = (s: AdminStaff) => targetIsSuper(s) && !isSuper;

  return (
    <div>
      <PageHeader
        title="Staff Members"
        subtitle={
          loading ? "Loading…" : `${staff.length} team member${staff.length === 1 ? "" : "s"}`
        }
        breadcrumbs={[{ label: "Staff & Security" }, { label: "Staff" }]}
        actions={
          canCreate ? (
            <Btn icon={<UserPlus size={13} />} onClick={openAddModal} disabled={!roles.length}>
              Add Staff
            </Btn>
          ) : undefined
        }
      />
      <ChangeMyPassword />
      <DataTable
        columns={columns}
        data={staff}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search staff…"
        emptyMessage="No staff accounts yet"
        actions={(s: AdminStaff) =>
          canEdit || canDelete ? (
            <div className="flex items-center gap-1">
              {canEdit && !lockedForMe(s) && (
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Edit Staff"
                >
                  <Edit2 size={13} />
                </button>
              )}
              {canDelete && s.id !== me?.id && !lockedForMe(s) && (
                <button
                  onClick={() => setDeleteTarget(s)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Staff"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to remove "${deleteTarget?.name}" (${deleteTarget?.email})? They will immediately lose access to the admin portal.`}
        confirmLabel="Delete Staff"
        destructive
      />

      {modalOpen && edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-white/80 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {isNew ? "Add Staff Member" : "Edit Staff Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contact details, sign-in password and access roles.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              key={formSessionKey || "modal-form"}
              onSubmit={(e) => {
                e.preventDefault();
                void save();
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
              <div
                style={{
                  position: "absolute",
                  opacity: 0,
                  height: 0,
                  width: 0,
                  pointerEvents: "none",
                  zIndex: -1,
                }}
                tabIndex={-1}
                aria-hidden="true"
              >
                <input type="text" name="autofill_honeypot_user" tabIndex={-1} autoComplete="off" />
                <input
                  type="password"
                  name="autofill_honeypot_pass"
                  tabIndex={-1}
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...noAutofill(formSessionKey, "name")}
                    placeholder="e.g. Rahul Sharma"
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    className={staffInputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="email"
                    {...noAutofill(formSessionKey, "email")}
                    placeholder="e.g. rahul@faasbay.com"
                    value={edit.email}
                    onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                    className={staffInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    inputMode="tel"
                    {...noAutofill(formSessionKey, "phone")}
                    placeholder="e.g. +91 98765 43210"
                    value={edit.phone || ""}
                    onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                    className={staffInputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Account Status</label>
                  <select
                    value={edit.status}
                    disabled={editingSelf}
                    title={editingSelf ? "You cannot deactivate your own account" : undefined}
                    onChange={(e) =>
                      setEdit({ ...edit, status: e.target.value as AdminStaff["status"] })
                    }
                    className={`${staffInputClass} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {editingSelf ? (
                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2">
                  To change your own password, use <b>Change my password</b> above — it asks for
                  your current password first.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                      <span>Login Password</span>
                      {isNew ? (
                        <span className="text-rose-500">*</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (leave blank to keep unchanged)
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEdit({ ...edit, password: generateStrongPassword() });
                        setShowPassword(true);
                      }}
                      className="text-[10.5px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <Key size={10} />
                      <span>Generate Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      {...noAutofill(formSessionKey, "password")}
                      autoCapitalize="off"
                      data-form-type="other"
                      placeholder={
                        isNew
                          ? `Set login password (min ${MIN_PASSWORD} characters)`
                          : "•••••••••••• (Unchanged)"
                      }
                      value={edit.password || ""}
                      onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                      style={
                        {
                          WebkitTextSecurity: showPassword ? "none" : "disc",
                          textSecurity: showPassword ? "none" : "disc",
                        } as React.CSSProperties
                      }
                      className={`${staffInputClass} pl-3 pr-9 font-mono tracking-wider`}
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
                  {!isNew && edit.password && (
                    <p className="text-[10.5px] text-amber-600">
                      Saving a new password signs this member out of every device.
                    </p>
                  )}
                </div>
              )}

              {/* ── Role assignment ── */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">
                    Assigned Roles ({selectedRoles.length} selected)
                  </label>
                  {onManageRoles && canDo(access, "security", "edit") ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        onManageRoles();
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-900 underline-offset-2 hover:underline cursor-pointer"
                    >
                      Manage roles →
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Select one or more</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  {roles.map((r) => {
                    const isSelected = selectedRoles.includes(r.name);
                    const restricted = r.name === SUPER_ADMIN && !isSuper;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={restricted}
                        onClick={() => toggleRole(r.name)}
                        title={
                          restricted ? "Only a Super Admin can grant this role" : r.description
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border disabled:opacity-40 disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200 cursor-pointer"
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                        <span>{r.name}</span>
                      </button>
                    );
                  })}
                  {selectedRoles
                    .filter((name) => !roles.some((r) => r.name === name))
                    .map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleRole(name)}
                        title="This role no longer exists — remove it before saving"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border bg-rose-50 text-rose-700 border-rose-200 cursor-pointer"
                      >
                        <AlertTriangle size={11} /> {name}
                      </button>
                    ))}
                </div>
              </div>
            </form>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                {!isNew && canDelete && !editingSelf && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = edit;
                      closeModal();
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
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={
                    saving || !edit.name.trim() || !edit.email.trim() || !selectedRoles.length
                  }
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Staff"}
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

interface RoleDraft {
  id?: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  isSystem?: boolean;
}

export function RolesPage({ access, onCount }: SectionProps) {
  const { roles, catalog, loading, reload } = useRoles();
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);
  const canManage = canDo(access, "security", "edit");

  useEffect(() => {
    if (!loading) onCount?.(roles.length);
  }, [loading, roles.length, onCount]);

  const modules = Object.entries(catalog);
  const readOnly = !!draft && draft.name === SUPER_ADMIN && draft.isSystem;
  /** Non-super-admins can only hand out permissions they hold themselves. */
  const grantable = (module: string, action: string) => canDo(access, module, action);

  const togglePerm = (module: string, action: string) => {
    if (!draft || readOnly || !grantable(module, action)) return;
    const current = draft.permissions[module] || [];
    let next = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    // Every other action implies being able to see the module.
    if (
      action !== "view" &&
      next.includes(action) &&
      !next.includes("view") &&
      catalog[module]?.actions.includes("view")
    )
      next = ["view", ...next];
    if (action === "view" && !next.includes("view")) next = [];
    const permissions = { ...draft.permissions };
    if (next.length) permissions[module] = catalog[module]!.actions.filter((a) => next.includes(a));
    else delete permissions[module];
    setDraft({ ...draft, permissions });
  };

  const toggleModule = (module: string) => {
    if (!draft || readOnly) return;
    const actions = catalog[module]!.actions.filter((a) => grantable(module, a));
    const hasAll = actions.every((a) => (draft.permissions[module] || []).includes(a));
    const permissions = { ...draft.permissions };
    if (hasAll) delete permissions[module];
    else
      permissions[module] = catalog[module]!.actions.filter(
        (a) => actions.includes(a) || (draft.permissions[module] || []).includes(a),
      );
    setDraft({ ...draft, permissions });
  };

  const save = async () => {
    if (!draft || !draft.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim(),
        permissions: draft.permissions,
      };
      if (draft.id) await api.put(`${API_ENDPOINTS.roles}/${encodeURIComponent(draft.id)}`, body);
      else await api.post(API_ENDPOINTS.roles, body);
      await reload();
      toast.success(draft.id ? `Updated “${body.name}”.` : `Created “${body.name}”.`);
      setDraft(null);
    } catch (e) {
      toast.error(errorMessage(e, "Could not save the role."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`${API_ENDPOINTS.roles}/${encodeURIComponent(target.id)}`);
      await reload();
      toast.success(`Deleted “${target.name}”.`);
    } catch (e) {
      toast.error(errorMessage(e, "Could not delete the role."));
    }
  };

  const permissionCount = (p: Record<string, string[]>) =>
    Object.values(p || {}).reduce((n, a) => n + a.length, 0);
  const totalActions = modules.reduce((n, [, def]) => n + def.actions.length, 0);

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle={loading ? "Loading…" : `${roles.length} roles configured`}
        breadcrumbs={[{ label: "Staff & Security" }, { label: "Roles" }]}
        actions={
          canManage ? (
            <Btn
              icon={<Plus size={13} />}
              onClick={() => setDraft({ name: "", description: "", permissions: {} })}
              disabled={loading}
            >
              Create Role
            </Btn>
          ) : undefined
        }
      />

      {!loading && roles.length === 0 && (
        <EmptyState
          icon={<Shield size={28} />}
          title="No roles yet"
          message="Create a role to start assigning access to staff."
        />
      )}

      <div className="space-y-3">
        {roles.map((role) => {
          const isSuperRole = role.name === SUPER_ADMIN && role.isSystem;
          const count = permissionCount(role.permissions);
          return (
            <Card key={role.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    {isSuperRole && <Shield size={13} className="text-amber-500" />}
                    {role.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {role.description || "No description"}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge>
                    <User size={9} /> {role.staffCount} staff
                  </Badge>
                  {role.isSystem && <Badge tone="blue">Built-in</Badge>}
                  {canManage && (
                    <>
                      <button
                        onClick={() =>
                          setDraft({
                            id: role.id,
                            name: role.name,
                            description: role.description,
                            permissions: { ...role.permissions },
                            isSystem: role.isSystem,
                          })
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title={isSuperRole ? "View permissions" : "Edit role"}
                      >
                        {isSuperRole ? <Eye size={13} /> : <Edit2 size={13} />}
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {isSuperRole ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                    Full access to every module
                  </span>
                ) : count === 0 ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-medium">
                    No permissions — staff with only this role can sign in but not use any module
                  </span>
                ) : (
                  Object.entries(role.permissions).map(([mod, actions]) => (
                    <span
                      key={mod}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium"
                    >
                      {catalog[mod]?.label || mod}: {(actions as string[]).join(", ")}
                    </span>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={readOnly ? SUPER_ADMIN : draft?.id ? `Edit role` : "Create role"}
        subtitle={
          readOnly
            ? "This role always has full access and cannot be changed."
            : `${draft ? permissionCount(draft.permissions) : 0} of ${totalActions} permissions granted`
        }
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Btn variant="ghost" onClick={() => setDraft(null)}>
              {readOnly ? "Close" : "Cancel"}
            </Btn>
            {!readOnly && (
              <Btn onClick={() => void save()} disabled={saving || !draft?.name.trim()}>
                {saving ? "Saving…" : draft?.id ? "Save changes" : "Create role"}
              </Btn>
            )}
          </div>
        }
      >
        {draft && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormField
                label="Role name"
                required
                {...(draft.isSystem ? { hint: "Built-in roles cannot be renamed" } : {})}
              >
                <Input
                  value={draft.name}
                  disabled={readOnly || !!draft.isSystem}
                  maxLength={60}
                  placeholder="e.g. Lead Merchandiser"
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  value={draft.description}
                  disabled={readOnly}
                  placeholder="What this role is for"
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </FormField>
            </div>

            <div className="rounded-xl border border-slate-200/80 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10.5px] uppercase tracking-wider text-slate-500">
                    <th className="text-left px-3 py-2 font-medium">Module</th>
                    <th className="text-left px-3 py-2 font-medium">Allowed actions</th>
                    <th className="px-3 py-2 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {modules.map(([module, def]) => {
                    const held = readOnly ? def.actions : draft.permissions[module] || [];
                    const allOn = def.actions.every((a) => held.includes(a));
                    return (
                      <tr key={module} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-800">{def.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{module}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {def.actions.map((action) => {
                              const on = held.includes(action);
                              const blocked = !readOnly && !grantable(module, action);
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  disabled={readOnly || blocked}
                                  onClick={() => togglePerm(module, action)}
                                  title={
                                    blocked
                                      ? "You can't grant a permission you don't have"
                                      : undefined
                                  }
                                  className={`px-2 py-1 rounded-md border text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                    on
                                      ? "bg-slate-900 text-white border-slate-900"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                  } ${readOnly || blocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                                >
                                  {on && <Check size={10} strokeWidth={3} />}
                                  {action}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => toggleModule(module)}
                              className="text-[10.5px] text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              {allOn ? "None" : "All"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!readOnly && (
              <p className="text-[11px] text-slate-400 mt-2">
                Changes apply to everyone with this role on their very next request — no sign-out
                needed. Granting any action also grants <b>view</b>.
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
        title="Delete role"
        message={
          deleteTarget?.staffCount
            ? `“${deleteTarget.name}” is assigned to ${deleteTarget.staffCount} staff member(s). Reassign them before deleting it.`
            : `Delete the “${deleteTarget?.name}” role? This cannot be undone.`
        }
        confirmLabel="Delete role"
        destructive
      />
    </div>
  );
}

// ── Audit Logs ──────────────────────────────────────────────────────────────

function renderValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function ChangeSummary({ previous, next }: { previous: unknown; next: unknown }) {
  const isObj = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === "object" && !Array.isArray(v);
  if (isObj(previous) || isObj(next)) {
    const p = isObj(previous) ? previous : {};
    const n = isObj(next) ? next : {};
    const keys = [...new Set([...Object.keys(p), ...Object.keys(n)])].slice(0, 6);
    return (
      <div className="mt-0.5 space-y-0.5">
        {keys.map((k) => (
          <div key={k} className="text-[10px] text-gray-400 truncate max-w-105">
            <span className="font-mono text-gray-500">{k}</span>:{" "}
            {k in p && <span className="line-through">{renderValue(p[k])}</span>}
            {k in p && k in n && " → "}
            {k in n && <span className="text-emerald-600">{renderValue(n[k])}</span>}
          </div>
        ))}
      </div>
    );
  }
  if (previous == null && next == null) return null;
  return (
    <div className="text-[10px] text-gray-400 mt-0.5">
      <span className="line-through">{renderValue(previous)}</span> →{" "}
      <span className="text-emerald-600">{renderValue(next)}</span>
    </div>
  );
}

export function AuditLogsPage({ onCount }: SectionProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [modules, setModules] = useState<string[]>([]);
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: "1000" });
      if (moduleFilter) qs.set("module", moduleFilter);
      if (statusFilter) qs.set("status", statusFilter);
      const res = await apiRequestRaw<{ data: AdminAuditLog[]; total: number; modules: string[] }>(
        `${API_ENDPOINTS.auditLogs}?${qs}`,
      );
      setLogs(Array.isArray(res.data) ? res.data : []);
      setTotal(res.total ?? res.data?.length ?? 0);
      setModules(res.modules || []);
      if (!moduleFilter && !statusFilter) onCount?.(res.total ?? 0);
    } catch (e) {
      toast.error(errorMessage(e, "Could not load audit logs."));
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, statusFilter, onCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = [
    {
      key: "timestamp",
      label: "Time",
      render: (l: AdminAuditLog) => (
        <span className="text-xs text-gray-500 whitespace-nowrap" title={l.timestamp}>
          {formatWhen(l.timestamp, false)}
        </span>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (l: AdminAuditLog) => (
        <div>
          <div className="text-xs text-gray-900">{l.user || "—"}</div>
          <div className="text-[10px] text-gray-400">{l.role || l.email}</div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (l: AdminAuditLog) => (
        <div className="flex items-center gap-1.5">
          {l.status === "Failed" ? (
            <XCircle size={12} className="text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
          )}
          <span className="text-[11px] font-mono text-gray-700">{l.action}</span>
        </div>
      ),
    },
    {
      key: "module",
      label: "Module",
      render: (l: AdminAuditLog) => (
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
          {l.module}
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      width: "35%",
      render: (l: AdminAuditLog) => (
        <div>
          <div className="text-xs text-gray-700">{l.details}</div>
          <ChangeSummary previous={l.previousValue} next={l.newValue} />
        </div>
      ),
    },
    {
      key: "ip",
      label: "Source",
      render: (l: AdminAuditLog) => (
        <div>
          <div className="text-[11px] font-mono text-gray-500">{l.ip || "—"}</div>
          <div className="text-[10px] text-gray-400">{l.device}</div>
        </div>
      ),
    },
  ];

  const selectClass =
    "px-2.5 py-1.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400 cursor-pointer";

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle={
          loading
            ? "Loading…"
            : total > logs.length
              ? `Showing latest ${logs.length} of ${total} entries`
              : `${total} activity log${total === 1 ? "" : "s"}`
        }
        breadcrumbs={[{ label: "Staff & Security" }, { label: "Audit Logs" }]}
        actions={
          <Btn
            variant="secondary"
            icon={<RefreshCw size={13} className={loading ? "animate-spin" : ""} />}
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </Btn>
        }
      />
      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        loading={loading}
        searchPlaceholder="Search user, action or details…"
        pageSize={15}
        emptyMessage="No activity recorded yet"
        exportable
        exportFilename={`faasbay-audit-log-${new Date().toISOString().slice(0, 10)}.csv`}
        filters={
          <div className="flex items-center gap-2">
            <select
              className={selectClass}
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="">All modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All results</option>
              <option value="Success">Succeeded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        }
      />
    </div>
  );
}

// ── Security ────────────────────────────────────────────────────────────────

interface SecuritySession {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AdminStaff["status"];
  avatar?: string;
  lastLogin: string | null;
  failedLoginAttempts: number;
  locked: boolean;
  lockedUntil: string | null;
  weakPassword: boolean;
}

interface SecurityOverview {
  stats: {
    signIns24h: number;
    failed24h: number;
    lockedAccounts: number;
    activeStaff: number;
    suspendedStaff: number;
    weakPasswords: number;
  };
  policy: {
    tokenTtl: string;
    maxFailedAttempts: number;
    lockoutMinutes: number;
    minPasswordLength: number;
  };
  checks: { key: string; label: string; ok: boolean; hint: string }[];
  sessions: SecuritySession[];
  recentLogins: AdminAuditLog[];
}

const LOGIN_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Signed in",
  LOGIN_FAILED: "Wrong password",
  LOGIN_UNKNOWN_ACCOUNT: "Unknown account",
  LOGIN_BLOCKED: "Sign-in blocked",
  PASSWORD_CHANGED: "Password changed",
  PASSWORD_CHANGE_FAILED: "Password change failed",
};

export function SecurityPage({ access, me }: SectionProps) {
  const [data, setData] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<SecuritySession | null>(null);
  const canManage = canDo(access, "security", "edit");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get<SecurityOverview>(API_ENDPOINTS.security, { timeoutMs: 30000 }));
    } catch (e) {
      toast.error(errorMessage(e, "Could not load the security overview."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unlock = async (s: SecuritySession) => {
    try {
      await api.post(`${API_ENDPOINTS.staff}/${encodeURIComponent(s.id)}/unlock`);
      toast.success(`${s.name} can sign in again.`);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Could not unlock the account."));
    }
  };

  const revoke = async () => {
    if (!revokeTarget) return;
    const target = revokeTarget;
    setRevokeTarget(null);
    try {
      await api.post(`${API_ENDPOINTS.staff}/${encodeURIComponent(target.id)}/revoke-sessions`);
      toast.success(`${target.name} has been signed out everywhere.`);
      // Revoking yourself ends this session too; the next request signs you out.
      if (target.id !== me?.id) await load();
      else await load().catch(() => undefined);
    } catch (e) {
      toast.error(errorMessage(e, "Could not sign out that member."));
    }
  };

  const failingChecks = data?.checks.filter((c) => !c.ok).length ?? 0;
  const loginEvents = useMemo(
    () => (data?.recentLogins || []).filter((l) => l.action in LOGIN_LABELS),
    [data],
  );

  return (
    <div>
      <PageHeader
        title="Security"
        subtitle="Sign-in activity, account lockouts and session control"
        breadcrumbs={[{ label: "Staff & Security" }, { label: "Security" }]}
        actions={
          <Btn
            variant="secondary"
            icon={<RefreshCw size={13} className={loading ? "animate-spin" : ""} />}
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </Btn>
        }
      />

      {!data && loading && (
        <div className="text-xs text-slate-400 py-10 text-center">Loading security overview…</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <KPICard
              title="Sign-ins (24h)"
              value={String(data.stats.signIns24h)}
              icon={<User size={14} />}
            />
            <KPICard
              title="Failed sign-ins (24h)"
              value={String(data.stats.failed24h)}
              icon={<ShieldAlert size={14} />}
            />
            <KPICard
              title="Locked accounts"
              value={String(data.stats.lockedAccounts)}
              icon={<Lock size={14} />}
            />
            <KPICard
              title="Security status"
              value={
                failingChecks === 0
                  ? "Healthy"
                  : `${failingChecks} issue${failingChecks === 1 ? "" : "s"}`
              }
              icon={failingChecks === 0 ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <Card className="p-4 lg:col-span-2">
              <div className="text-xs font-semibold text-slate-800 mb-3">Security checks</div>
              <div className="space-y-2">
                {data.checks.map((c) => (
                  <div key={c.key} className="flex items-start gap-2.5">
                    {c.ok ? (
                      <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div
                        className={`text-xs ${c.ok ? "text-slate-700" : "text-slate-900 font-medium"}`}
                      >
                        {c.label}
                      </div>
                      {!c.ok && <div className="text-[11px] text-slate-500">{c.hint}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-semibold text-slate-800 mb-3">Active policy</div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Session lifetime</dt>
                  <dd className="text-slate-800 font-medium">{data.policy.tokenTtl}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Lock after</dt>
                  <dd className="text-slate-800 font-medium">
                    {data.policy.maxFailedAttempts} failed attempts
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Lockout duration</dt>
                  <dd className="text-slate-800 font-medium">{data.policy.lockoutMinutes} min</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Minimum password</dt>
                  <dd className="text-slate-800 font-medium">
                    {data.policy.minPasswordLength} characters
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Active / disabled staff</dt>
                  <dd className="text-slate-800 font-medium">
                    {data.stats.activeStaff} / {data.stats.suspendedStaff}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className="text-xs font-semibold text-slate-800 mb-2">Staff access</div>
          <Card className="overflow-x-auto mb-5">
            <table className="w-full text-sm min-w-160">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-2.5 font-medium">Staff member</th>
                  <th className="text-left px-3 py-2.5 font-medium">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium">Last sign-in</th>
                  <th className="text-left px-3 py-2.5 font-medium">Flags</th>
                  {canManage && <th className="text-right px-4 py-2.5 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="text-xs text-gray-900 font-medium">
                        {s.name} {s.id === me?.id && <Badge tone="blue">You</Badge>}
                      </div>
                      <div className="text-[10px] text-gray-400">{s.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={s.status} size="xs" />
                    </td>
                    <td
                      className="px-3 py-2.5 text-xs text-gray-500"
                      title={s.lastLogin || undefined}
                    >
                      {formatWhen(s.lastLogin)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {s.locked && (
                          <Badge tone="rose">
                            <Lock size={9} /> Locked until {formatWhen(s.lockedUntil, false)}
                          </Badge>
                        )}
                        {!s.locked && s.failedLoginAttempts > 0 && (
                          <Badge tone="amber">
                            {s.failedLoginAttempts} failed attempt
                            {s.failedLoginAttempts === 1 ? "" : "s"}
                          </Badge>
                        )}
                        {s.weakPassword && (
                          <Badge tone="amber">
                            <Key size={9} /> Default password
                          </Badge>
                        )}
                        {!s.locked && !s.failedLoginAttempts && !s.weakPassword && (
                          <span className="text-[11px] text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {s.locked && (
                            <button
                              onClick={() => void unlock(s)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Allow sign-in again"
                            >
                              <Unlock size={12} /> Unlock
                            </button>
                          )}
                          <button
                            onClick={() => setRevokeTarget(s)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Invalidate every active session"
                          >
                            <LogOut size={12} /> Sign out everywhere
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="text-xs font-semibold text-slate-800 mb-2">Sign-in history</div>
          <Card className="overflow-x-auto">
            {loginEvents.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">
                No sign-in activity recorded yet.
              </div>
            ) : (
              <table className="w-full text-sm min-w-180">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 font-medium">User</th>
                    <th className="text-left px-3 py-2.5 font-medium">Time</th>
                    <th className="text-left px-3 py-2.5 font-medium">Event</th>
                    <th className="text-left px-3 py-2.5 font-medium">IP</th>
                    <th className="text-left px-3 py-2.5 font-medium">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {loginEvents.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50" title={l.details}>
                      <td className="px-4 py-2.5">
                        <div className="text-xs text-gray-900">{l.user}</div>
                        {l.email && l.email !== l.user && (
                          <div className="text-[10px] text-gray-400">{l.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                        {formatWhen(l.timestamp)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge
                            status={l.status === "Failed" ? "Failed" : "Active"}
                            size="xs"
                          />
                          <span className="text-xs text-gray-600">{LOGIN_LABELS[l.action]}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500">{l.ip || "—"}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{l.device || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => void revoke()}
        title="Sign out everywhere"
        message={
          revokeTarget?.id === me?.id
            ? "This signs you out of every device, including this one. You'll need to sign in again."
            : `Sign ${revokeTarget?.name} out of every device? They can sign back in with their password.`
        }
        confirmLabel="Sign out everywhere"
        destructive
      />
    </div>
  );
}

// ── Master Staff & Security View with Sub-Navigation ───────────────────────

export default function StaffSecurityMasterView({
  initialTab = "staff",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string | undefined;
  initialSubTab?: string | undefined;
  onSubTabChange?: ((sub: string) => void) | undefined;
}) {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subTab");
      if (sub) return sub;
    }
    return initialSubTab || initialTab || "staff";
  });
  const [me, setMe] = useState<AdminUser | null>(() => getAdminUser());
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [accessError, setAccessError] = useState(false);
  const [counts, setCounts] = useState<Record<string, number | undefined>>({});

  // Permissions are resolved server-side from live role documents.
  useEffect(() => {
    api
      .get<AdminUser & { access: AdminAccess }>(API_ENDPOINTS.adminMe)
      .then((user) => {
        setMe(user);
        setAccess(user.access);
      })
      .catch(() => setAccessError(true));
  }, []);

  const setStaffCount = useCallback((n: number) => setCounts((c) => ({ ...c, staff: n })), []);
  const setRolesCount = useCallback((n: number) => setCounts((c) => ({ ...c, roles: n })), []);
  const setLogsCount = useCallback((n: number) => setCounts((c) => ({ ...c, audit_logs: n })), []);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    onSubTabChange?.(newTab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("faasbay_admin_sub_tab", newTab);
      } catch {
        /* storage unavailable */
      }
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const tabs = [
    {
      key: "staff",
      label: "Staff Members",
      count: counts["staff"],
      allowed: canDo(access, "staff", "view"),
    },
    {
      key: "roles",
      label: "Roles & Permissions",
      count: counts["roles"],
      allowed: canDo(access, "staff", "view"),
    },
    {
      key: "audit_logs",
      label: "Activity Audit Logs",
      count: counts["audit_logs"],
      allowed: canDo(access, "security", "view"),
    },
    { key: "security", label: "Security & Sessions", allowed: canDo(access, "security", "view") },
  ].filter((t) => t.allowed);

  if (accessError) {
    return (
      <EmptyState
        icon={<ShieldAlert size={28} />}
        title="Could not verify your access"
        message="Refresh the page or sign in again."
      />
    );
  }
  if (!access) {
    return <div className="text-xs text-slate-400 py-10 text-center">Checking your access…</div>;
  }
  if (!tabs.length) {
    return (
      <EmptyState
        icon={<Lock size={28} />}
        title="No access"
        message="Your role doesn't include Staff or Security permissions. Ask a Super Admin if you need access."
      />
    );
  }

  const active = tabs.some((t) => t.key === tab) ? tab : tabs[0]!.key;
  const props = { access, me };

  return (
    <div className="space-y-4">
      <TabSwitcher
        tabs={tabs.map(({ key, label, count }) =>
          count === undefined ? { key, label } : { key, label, count },
        )}
        active={active}
        onChange={handleTabChange}
      />

      {active === "staff" && (
        <StaffPage
          {...props}
          onCount={setStaffCount}
          onManageRoles={() => handleTabChange("roles")}
        />
      )}
      {active === "roles" && <RolesPage {...props} onCount={setRolesCount} />}
      {active === "audit_logs" && <AuditLogsPage {...props} onCount={setLogsCount} />}
      {active === "security" && <SecurityPage {...props} />}
    </div>
  );
}
