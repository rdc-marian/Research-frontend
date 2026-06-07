"use client";

import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { researchGuideNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function ResearchGuideProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setDepartment(user.department || "");
    }
  }, [user]);

  return (
    <PageLayout
      title="My Profile"
      userName={user?.name || "Research Guide"}
      roleLabel="Research Guide"
      navItems={researchGuideNav}
      activeItem="Profile"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
          Profile details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep your research guide profile up to date.
        </p>
        <form className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="name">
              Full name
            </label>
            <input id="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
              Email
            </label>
            <input id="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} disabled />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="department">
              Research Center
            </label>
            <input id="department" className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Update Profile
            </button>
            <Link
              href="/research-guide/profile/change-password"
              className="rounded-full border border-[color:var(--border)] px-6 py-2 text-xs font-semibold text-slate-600"
            >
              Change Password
            </Link>
          </div>
        </form>
      </section>
    </PageLayout>
  );
}
