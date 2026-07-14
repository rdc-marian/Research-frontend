"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { apiPostJson } from "@/lib/api";

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function ScholarChangePasswordPage() {
  const { user, login } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      userName={user?.name || "Scholar"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="Profile"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/scholar/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h2 className="mt-4 font-display text-lg text-[color:var(--maroon-900)]">
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a strong password for your scholar account.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="currentPassword">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              className={inputClass}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--maroon-900)] transition disabled:opacity-75"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
