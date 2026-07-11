"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { scholarNav } from "@/data/roleNav";
import { apiGet, type ApiItemResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Submission = {
  _id: string;
  title: string;
  abstract: string;
  department: string;
  submittedAt?: string;
  status: string;
  scholar?: { name?: string } | null;
  file?: { url?: string; originalName?: string } | null;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function ScholarApprovalDetailsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const submissionId = useMemo(() => searchParams.get("id") ?? "", [searchParams]);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(Boolean(submissionId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet<ApiItemResponse<Submission>>(`/submissions/${submissionId}`);
        if (!isMounted) return;
        setSubmission(response.item);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load approval details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  return (
    <PageLayout
      title="Approval Details"
      userName={user?.name || "Scholar"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="My Approvals"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link href="/scholar/approvals" className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]">
          <ArrowLeft className="h-4 w-4" />
          Back to My Approvals
        </Link>
        <div className="mt-4">
          {loading ? <p className="text-sm text-slate-500">Loading approval details...</p> : null}
          {!loading && !submissionId ? <p className="text-sm text-slate-500">Missing submission id.</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">Failed to load: {error}</p> : null}
          {!loading && !error && submission ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl text-[color:var(--maroon-900)]">{submission.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Submitted on {formatDate(submission.submittedAt)}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span>Department: {submission.department}</span>
                  <span>Submitted by: {submission.scholar?.name ?? "Unknown"}</span>
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">Abstract</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{submission.abstract}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">File</h3>
                {submission.file?.url ? (
                  <a href={submission.file.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--maroon-700)]">
                    <Paperclip className="h-4 w-4" />
                    {submission.file.originalName ?? "Open attachment"}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No file attached.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}

export default function ScholarApprovalDetailsPage() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
      <ScholarApprovalDetailsContent />
    </Suspense>
  );
}
