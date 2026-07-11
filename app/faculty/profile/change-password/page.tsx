"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { facultyNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function FacultyChangePasswordPage() {
  const { user } = useAuth();
  return (
    <PageLayout
      title="Change Password"
      userName={user?.name || "Faculty"}
      roleLabel="Faculty Member"
      navItems={facultyNav}
      activeItem="Profile"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/faculty/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your account password.
        </p>
        <form className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="currentPassword">
              Current password
            </label>
            <input id="currentPassword" type="password" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="newPassword">
              New password
            </label>
            <input id="newPassword" type="password" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input id="confirmPassword" type="password" className={inputClass} />
          </div>
          <button
            type="button"
            className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2 text-xs font-semibold text-white shadow-sm"
          >
            Update Password
          </button>
        </form>
      </section>
    </PageLayout>
  );
}
