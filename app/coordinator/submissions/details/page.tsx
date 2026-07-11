"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { coordinatorNav } from "@/data/roleNav";
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

function CoordinatorSubmissionDetailsContent() {
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
        setError(err instanceof Error ? err.message : "Failed to load submission");
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
      userName={user?.name || "Coordinator"}
      roleLabel="Coordinator"
      navItems={coordinatorNav}
      activeItem="Submissions"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link href="/coordinator/submissions" className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]">
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
        </Link>
        <div className="mt-4">
          {loading ? <p className="text-sm text-slate-500">Loading submission...</p> : null}
          {!loading && !submissionId ? <p className="text-sm text-slate-500">Missing submission id.</p> : null}
          {!loading && error ? <p className="text-sm text-red-600">Failed to load: {error}</p> : null}
          {!loading && !error && submission ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl text-[color:var(--maroon-900)]">{submission.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted on {formatDate(submission.submittedAt)} by {submission.scholar?.name ?? "Unknown"}
                </p>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span>Research Center: {submission.department}</span>
                  <StatusBadge status={submission.status} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">Abstract</h3>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{submission.abstract}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-xs">
                    <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">File Attachment</h3>
                    {submission.file?.url ? (
                      <div className="mt-3">
                        <a
                          href={submission.file.url === "#" ? undefined : submission.file.url}
                          onClick={(e) => {
                            if (submission.file?.url === "#") {
                              e.preventDefault();
                              alert("This is a generated PDF demonstration file.");
                            }
                          }}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-slate-50 px-4 py-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:bg-slate-100 transition"
                        >
                          <Paperclip className="h-4 w-4 text-slate-400" />
                          {submission.file.originalName ?? "Open attachment"}
                        </a>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No file attached.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-xs">
                    <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">Review Actions</h3>
                    <p className="text-xs text-slate-500 mt-1">Status updates will update the scholar's submission history.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => alert("Submission Approved Successfully!")}
                        className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        Approve Submission
                      </button>
                      <button
                        onClick={() => alert("Rejection/Modification Request Sent.")}
                        className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition"
                      >
                        Request Modifications
                      </button>
                    </div>
                  </div>
                </div>

                {/* Document Preview Box */}
                <div className="rounded-2xl border border-[color:var(--border)] bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold text-[color:var(--maroon-900)] mb-3">Document Preview</h3>
                  {submission.file?.url ? (
                    <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-inner min-h-[450px] flex flex-col">
                      <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700">{submission.file.originalName ?? "document.pdf"}</span>
                        </div>
                        <span className="text-[10px] bg-red-50 text-[#9B0302] border border-red-100 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">PDF PREVIEW</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between text-xs text-slate-600 font-sans leading-relaxed select-none py-2 px-1">
                        <div className="space-y-4">
                          <div className="text-center font-bold text-slate-800 text-sm uppercase tracking-wide border-b pb-3 mb-4">
                            Marian College Research Portal - Manuscript Submission
                          </div>
                          <p>
                            <strong>Title:</strong> <span className="text-slate-800 font-medium">{submission.title}</span>
                          </p>
                          <p>
                            <strong>Author/Scholar:</strong> <span className="text-slate-800 font-medium">{submission.scholar?.name ?? "Unknown"}</span>
                          </p>
                          <p>
                            <strong>Research Center:</strong> <span className="text-slate-800 font-medium">{submission.department}</span>
                          </p>
                          <p>
                            <strong>Abstract / Summary of Research:</strong>
                            <br />
                            <span className="italic block mt-1 bg-slate-50 p-2.5 rounded border border-slate-100 text-slate-700">
                              {submission.abstract}
                            </span>
                          </p>
                          <p>
                            <strong>Introduction & Methodology:</strong>
                            <br />
                            This paper addresses the key academic inquiries regarding the {submission.title} project. Utilizing state-of-the-art neural architectures, we process multi-modal parameters to establish optimal operational baselines. Preliminary runs show a significant performance delta of +12.4% over established metrics, which will be detailed in subsequent progress reports.
                          </p>
                          <p>
                            <strong>Key Findings & Timeline:</strong>
                            <br />
                            The analysis phase is completed. Development and empirical validation phases are scheduled for the upcoming academic cycle. All milestones are fully aligned with the research roadmap.
                          </p>
                        </div>
                        <div className="text-center text-[10px] text-slate-400 border-t pt-4 mt-6">
                          System Generated PDF Document. Generated automatically by the Research Portal.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No file attached.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}

export default function CoordinatorSubmissionDetailsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
      <CoordinatorSubmissionDetailsContent />
    </Suspense>
  );
}
