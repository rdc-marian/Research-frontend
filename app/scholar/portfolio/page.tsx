"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ListCollapse,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type CategorySummary = {
  total: number;
  Pending: number;
  Approved: number;
  Rejected: number;
};

type SummaryResponse = {
  summary: {
    qualifications: CategorySummary;
    publications: CategorySummary;
    conferences: CategorySummary;
    patents: CategorySummary;
    workshops: CategorySummary;
    memberships: CategorySummary;
    scholarships: CategorySummary;
    leaves: CategorySummary;
    projects: CategorySummary;
    guidance: CategorySummary;
    grants: CategorySummary;
    awards: CategorySummary;
    consultancy: CategorySummary;
    resourcePerson: CategorySummary;
  };
};

const defaultStats = {
  qualifications: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  publications: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  conferences: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  patents: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  workshops: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  memberships: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  scholarships: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  leaves: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  projects: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  guidance: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  grants: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  awards: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  consultancy: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
  resourcePerson: { total: 0, Pending: 0, Approved: 0, Rejected: 0 },
};

export default function ScholarPortfolioDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const load = async () => {
      try {
        console.log("Loading state: true");
        setLoading(true);
        setError(null);
        
        // Ensure we are using the correct base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000/api";
        const url = `${baseUrl}/portfolio/summary?scholarId=${user._id}`;
        console.log("API URL:", url);
        
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          }
        });
        
        console.log("Response status:", response.status);
        
        const text = await response.text();
        console.log("Response body:", text);
        
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}: ${text}`);
        }
        
        const res = JSON.parse(text) as SummaryResponse;
        
        if (!isMounted) return;
        setStats(res.summary);
      } catch (err) {
        console.error("API Error:", err);
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load summary stats";
        setError(message);
      } finally {
        console.log("Executing finally block");
        if (isMounted) {
          console.log("Loading state: false");
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [user?._id, authLoading]);

  const categories = [
    {
      key: "qualifications",
      title: "Qualifications",
      desc: "Academic degrees, UG/PG, NET/GATE certificates.",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      href: "/scholar/portfolio/qualifications",
    },
    {
      key: "publications",
      title: "Publications",
      desc: "Research journals, book chapters, conference papers.",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/scholar/portfolio/publications",
    },
    {
      key: "conferences",
      title: "Conferences",
      desc: "Conference attendances, oral/poster presentations.",
      icon: Trophy,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      href: "/scholar/portfolio/conferences",
    },
    {
      key: "patents",
      title: "Patents",
      desc: "Filed, published, or granted patents.",
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      href: "/scholar/portfolio/patents",
    },
    {
      key: "workshops",
      title: "Workshops & FDPs",
      desc: "Seminars, organized programs, and training programs.",
      icon: ListCollapse,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      href: "/scholar/portfolio/workshops",
    },
    {
      key: "memberships",
      title: "Memberships",
      desc: "Professional body memberships (IEEE, ACM, etc.).",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      href: "/scholar/portfolio/memberships",
    },
    {
      key: "projects",
      title: "Research Projects",
      desc: "Funded and non-funded research projects.",
      icon: BookOpen,
      color: "text-orange-600 bg-orange-50 border-orange-100",
      href: "/scholar/portfolio/projects",
    },
    {
      key: "guidance",
      title: "Research Guidance",
      desc: "PhD, PG, and UG students guided.",
      icon: Users,
      color: "text-teal-600 bg-teal-50 border-teal-100",
      href: "/scholar/portfolio/guidance",
    },
    {
      key: "grants",
      title: "Research Grants",
      desc: "Grants received for research activities.",
      icon: FileText,
      color: "text-lime-600 bg-lime-50 border-lime-100",
      href: "/scholar/portfolio/grants",
    },
    {
      key: "awards",
      title: "Awards & Recognitions",
      desc: "Awards and honors received.",
      icon: Award,
      color: "text-yellow-600 bg-yellow-50 border-yellow-100",
      href: "/scholar/portfolio/awards",
    },
    {
      key: "consultancy",
      title: "Consultancy",
      desc: "Consultancy projects and activities.",
      icon: ListCollapse,
      color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100",
      href: "/scholar/portfolio/consultancy",
    },
    {
      key: "resourcePerson",
      title: "Resource Person",
      desc: "Invited talks and resource person activities.",
      icon: Users,
      color: "text-sky-600 bg-sky-50 border-sky-100",
      href: "/scholar/portfolio/resource-person",
    },
    {
      key: "scholarships",
      title: "Scholarships & Fellowships",
      desc: "Stipends, fellowship grants, JRF/SRF statuses.",
      icon: FileText,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
      href: "/scholar/portfolio/scholarships",
    },
    {
      key: "leaves",
      title: "Leave Applications",
      desc: "Casual, sick, and duty leaves applications.",
      icon: Calendar,
      color: "text-slate-600 bg-slate-50 border-slate-100",
      href: "/scholar/leaves",
    },
  ];

  return (
    <PageLayout
      title="My Portfolio"
      userName={user?.name || "Scholar User"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="My Portfolio"
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-[color:var(--maroon-900)] font-bold">Research Portfolio</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your accomplishments, research papers, and leave requests.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span>Failed to load portfolio statistics: {error}</span>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publications</span>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">
                {stats.publications.Approved}
              </span>
              <span className="text-xs text-slate-500">/{stats.publications.total} approved</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Patents</span>
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">
                {stats.patents.Approved}
              </span>
              <span className="text-xs text-slate-500">/{stats.patents.total} approved</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conferences</span>
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">
                {stats.conferences.Approved}
              </span>
              <span className="text-xs text-slate-500">/{stats.conferences.total} approved</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leave Requests</span>
              <Calendar className="h-5 w-5 text-rose-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">
                {stats.leaves.Pending}
              </span>
              <span className="text-xs text-slate-500">pending review</span>
            </div>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const categoryStats = stats[cat.key as keyof typeof stats] || { total: 0, Pending: 0, Approved: 0, Rejected: 0 };
            return (
              <div
                key={cat.key}
                className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_10px_24px_rgba(91,11,22,0.06)] hover:shadow-[0_14px_28px_rgba(91,11,22,0.08)] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl border ${cat.color} flex-shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base text-[color:var(--maroon-900)]">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[color:var(--border)] flex items-center justify-between gap-4">
                  <div className="flex gap-4 text-xs">
                    {categoryStats.total === 0 ? (
                      <span className="text-slate-500 italic">No records added yet</span>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold text-slate-700">{categoryStats.total}</span>
                          <span className="text-slate-400 ml-1">Total</span>
                        </div>
                        <div>
                          <span className="font-semibold text-rose-600">{categoryStats.Pending}</span>
                          <span className="text-slate-400 ml-1">Pending</span>
                        </div>
                        <div>
                          <span className="font-semibold text-emerald-600">{categoryStats.Approved}</span>
                          <span className="text-slate-400 ml-1">Approved</span>
                        </div>
                      </>
                    )}
                  </div>
                  <Link
                    href={cat.href}
                    className="rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-200"
                  >
                    {loading ? "Loading..." : "Manage"}
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </PageLayout>
  );
}
