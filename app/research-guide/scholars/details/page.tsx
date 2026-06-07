"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { researchGuideNav } from "@/data/roleNav";
import { apiGet, type ApiItemResponse, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Scholar = {
  _id: string;
  name?: string;
  email?: string;
  department?: string;
  status?: string;
};

type Submission = {
  _id: string;
  title: string;
  submittedAt?: string;
  status: string;
};

const submissionColumns = [
  { key: "title", label: "Title" },
  { key: "submitted", label: "Submitted On" },
  { key: "status", label: "Status", align: "right" as const },
];

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function ResearchGuideScholarDetailsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const scholarId = useMemo(() => searchParams.get("id") ?? "", [searchParams]);
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(Boolean(scholarId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scholarId) {
      return;
    }
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [scholarRes, submissionRes] = await Promise.all([
          apiGet<ApiItemResponse<Scholar>>(`/users/${scholarId}`),
          apiGet<ApiListResponse<Submission>>(`/submissions?scholarId=${scholarId}`),
        ]);
        if (!isMounted) return;
        setScholar(scholarRes.item);
        setSubmissions(submissionRes.items);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load scholar details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [scholarId]);

  const rows = useMemo(
    () =>
      submissions.map((item) => ({
        id: item._id,
        title: item.title,
        submitted: formatDate(item.submittedAt),
        status: <StatusBadge status={item.status} />,
      })),
    [submissions]
  );

  return (
    <PageLayout
      title="Scholar Details"
      userName={user?.name || "Research Guide"}
      roleLabel="Research Guide"
      navItems={researchGuideNav}
      activeItem="Scholars"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link href="/research-guide/scholars" className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]">
          <ArrowLeft className="h-4 w-4" />
          Back to Scholars
        </Link>
        <div className="mt-4">
          {loading ? <p className="text-sm text-slate-500">Loading scholar details...</p> : null}
          {!loading && !scholarId ? <p className="text-sm text-slate-500">Missing scholar id.</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">Failed to load: {error}</p> : null}
          {!loading && !error && scholar ? (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--muted)] text-sm font-semibold text-[color:var(--maroon-800)]">
                  {(scholar.name ?? "NA")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-lg text-[color:var(--maroon-900)]">{scholar.name ?? "Unknown"}</h2>
                  <p className="text-sm text-slate-500">{scholar.email ?? "N/A"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{scholar.department ? `${scholar.department} Research Center` : "N/A"}</span>
                    <StatusBadge status={scholar.status ?? "Active"} />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
                  <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">Submissions</h3>
                </div>
                <div className="mt-4">
                  <DataTable columns={submissionColumns} rows={rows} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}

export default function ResearchGuideScholarDetailsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
      <ResearchGuideScholarDetailsContent />
    </Suspense>
  );
}
