"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { apiGet, apiPostForm, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type Scholar = {
  _id: string;
  name: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function ScholarNewSubmissionPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    scholarId: "",
    abstract: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (user?._id) {
      setFormState((prev) => ({ ...prev, scholarId: user._id }));
    }
  }, [user?._id]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (
        !formState.title.trim() ||
        !formState.abstract.trim() ||
        !formState.scholarId
      ) {
        setError("Title, abstract, and scholar are required.");
        setSaving(false);
        return;
      }

      const payload = new FormData();
      payload.append("title", formState.title.trim());
      payload.append("abstract", formState.abstract.trim());
      payload.append("scholarId", formState.scholarId);
      if (formState.file) {
        payload.append("file", formState.file);
      }

      await apiPostForm("/submissions", payload);
      setSuccess("Submission created successfully.");
      setFormState({
        title: "",
        scholarId: "",
        abstract: "",
        file: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit research";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="New Submission"
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
        <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
          New submission
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Submit your research paper for review.
        </p>
        <form className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              placeholder="Enter research title"
              className={inputClass}
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="file">
              File upload (PDF)
            </label>
            <input
              id="file"
              type="file"
              className={inputClass}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  file: event.target.files?.[0] ?? null,
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Scholar
            </label>
            <div className={inputClass}>
              {user?.name || "Scholar"}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="abstract">
              Abstract
            </label>
            <textarea
              id="abstract"
              placeholder="Enter abstract"
              className={`${inputClass} min-h-[120px] resize-none`}
              value={formState.abstract}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, abstract: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !formState.scholarId}
              className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2 text-xs font-semibold text-white shadow-sm"
            >
              {saving ? "Submitting..." : "Submit"}
            </button>
            <Link
              href="/scholar/submissions"
              className="rounded-full border border-[color:var(--border)] px-6 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </Link>
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
        </form>
      </section>
    </PageLayout>
  );
}
