"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { scholarNav } from "@/data/roleNav";
import { apiGet, type ApiItemResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type SubmissionFile = {
  url?: string;
  originalName?: string;
};

type Submission = {
  _id: string;
  title: string;
  abstract: string;
  submittedAt?: string;
  status: string;
  supervisor?: { name?: string } | null;
  scholar?: {
    _id: string;
    name: string;
    researchCenter?: {
      _id: string;
      name: string;
    } | null;
  } | null;
  file?: SubmissionFile | null;
  reviewNote?: string | null;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ScholarSubmissionDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const submissionId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet<ApiItemResponse<Submission>>(
          `/submissions/${submissionId}`
        );
        if (!isMounted) return;
        setSubmission(response.item);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load submission";
        setError(message);
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
      title="Submission Details"
      userName={user?.name || "Scholar"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="My Submissions"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/scholar/submissions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Submissions
        </Link>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading submission...</p>
          ) : error ? (
            <p className="text-sm text-red-600">Failed to load: {error}</p>
          ) : !submission ? (
            <p className="text-sm text-slate-500">Submission not found.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-xl text-[color:var(--maroon-900)]">
                    {submission.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Submitted on {formatDate(submission.submittedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span>Research Center: {submission.scholar?.researchCenter?.name || "MCA"}</span>
                    <span>
                      Supervisor: {submission.supervisor?.name ?? "Unassigned"}
                    </span>
                    <StatusBadge status={submission.status} />
                  </div>
                </div>
                {submission.reviewNote && (
                  <div className={`rounded-2xl border p-4 ${
                    submission.status === "Rejected"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}>
                    <h3 className={`text-sm font-semibold ${
                      submission.status === "Rejected" ? "text-red-900" : "text-blue-900"
                    }`}>
                      {submission.status === "Rejected" ? "Rejection Reason" : "Reviewer Remarks"}
                    </h3>
                    <p className="mt-1 text-sm whitespace-pre-line">{submission.reviewNote}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">
                    Abstract
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                    {submission.abstract}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">
                  Attached file
                </h3>
                {submission.file?.url ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      {submission.file.originalName ?? "Attachment"}
                    </div>
                    <a
                      href={submission.file.url}
                      download={submission.file.originalName ?? "attachment"}
                      className="text-xs font-semibold text-[color:var(--maroon-700)]"
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No attachment uploaded.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
