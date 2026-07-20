"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { adminNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";
import { apiPostJson } from "@/lib/api";

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 pr-10 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function AdminSettingsPage() {
  const { user, login } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPostJson<{ token: string; user: any }>("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      if (res && res.token && res.user) {
        login(res.token, res.user);
      }
      setSuccess("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Change Password"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Change Password"
    >
      <section className="max-w-2xl rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h2 className="font-display text-lg font-bold text-[color:var(--maroon-900)]">
          Change Account Password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Update your administrative login credentials below.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-semibold text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="currentPassword">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showOldPassword ? "text" : "password"}
                required
                className={inputClass}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--maroon-900)] transition disabled:opacity-75"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
