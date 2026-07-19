"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { facultyNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, type ApiItemResponse } from "@/lib/api";
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
  scholar?: {
    name?: string;
    researchCenter?: {
      name?: string;
    };
  } | null;
  file?: SubmissionFile | null;
  reviewNote?: string | null;
};

type UpdateSubmissionStatusResponse = ApiItemResponse<Submission>;

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

export default function FacultySubmissionDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const submissionId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

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
        const message = err instanceof Error ? err.message : "Failed to load submission";
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

  const handleChangeStatus = async (status: string, note?: string) => {
    if (!submissionId) return;

    if (status === "Rejected" && (!note || !note.trim())) {
      setError("Rejection reason is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await apiPatchJson<UpdateSubmissionStatusResponse>(
        `/submissions/${submissionId}/status`,
        { status, note, reviewerId: user?._id }
      );
      setSubmission(response.item);
      setSuccess(`Status updated to ${status}`);
      setShowRejectForm(false);
      setRejectReason("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Submission Details"
      userName={user?.name || "Faculty"}
      roleLabel="Faculty Member"
      navItems={facultyNav}
      activeItem="Submissions"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/faculty/submissions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
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
                    Submitted on {formatDate(submission.submittedAt)} by {submission.scholar?.name ?? 'Unknown'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span>Research Center: {submission.scholar?.researchCenter?.name || "N/A"}</span>
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
                <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">
                    File
                  </h3>
                  {submission.file?.url ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-[color:var(--border)] px-3 py-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        {submission.file.originalName ?? 'Attachment'}
                      </div>
                      <a
                        href={submission.file.url}
                        download={submission.file.originalName ?? 'attachment'}
                        className="text-xs font-semibold text-[color:var(--maroon-700)]"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No file attached.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[color:var(--maroon-900)]">Actions</h3>
                <div className="mt-4 space-y-3">
                  {!showRejectForm ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleChangeStatus('Approved')}
                        disabled={saving || submission.status === 'Approved'}
                        className="w-full rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white hover:bg-[color:var(--maroon-900)] transition disabled:opacity-50"
                      >
                        {saving ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(true)}
                        disabled={saving || submission.status === 'Rejected'}
                        className="w-full rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Reason for Rejection *
                        </label>
                        <textarea
                          placeholder="Please provide a reason for rejection..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-[color:var(--border)] p-2 text-xs text-slate-700 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleChangeStatus('Rejected', rejectReason);
                          }}
                          disabled={saving || !rejectReason.trim()}
                          className="flex-1 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {saving ? 'Processing...' : 'Confirm Reject'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectReason("");
                          }}
                          disabled={saving}
                          className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
                  {error ? <p className="text-xs text-red-600">{error}</p> : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
