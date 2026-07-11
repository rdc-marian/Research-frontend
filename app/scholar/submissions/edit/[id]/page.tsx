"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { scholarNav } from "@/data/roleNav";
import { useAuth } from "@/components/AuthProvider";
import {
  apiGet,
  apiPatchForm,
  type ApiItemResponse,
  type ApiListResponse,
} from "@/lib/api";

type Department = {
  _id: string;
  name: string;
};

type Scholar = {
  _id: string;
  name: string;
};

type Submission = {
  _id: string;
  title: string;
  abstract: string;
  department: string;
  scholar?: { _id?: string } | null;
  file?: { originalName?: string } | null;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--maroon-600)]";

export default function ScholarEditSubmissionPage() {
  const { user } = useAuth();
  const params = useParams();
  const submissionId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    department: "",
    scholarId: "",
    abstract: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!submissionId) return;
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [departmentsRes, scholarsRes, submissionRes] = await Promise.all([
          apiGet<ApiListResponse<Department>>("/departments"),
          apiGet<ApiListResponse<Scholar>>("/users?role=scholar"),
          apiGet<ApiItemResponse<Submission>>(`/submissions/${submissionId}`),
        ]);
        if (!isMounted) return;
        setDepartments(departmentsRes.items);
        setScholars(scholarsRes.items);
        setFormState({
          title: submissionRes.item.title ?? "",
          department: submissionRes.item.department ?? "",
          scholarId: submissionRes.item.scholar?._id ?? "",
          abstract: submissionRes.item.abstract ?? "",
          file: null,
        });
        setCurrentFileName(submissionRes.item.file?.originalName ?? null);
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

  const handleSubmit = async () => {
    if (!submissionId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (
        !formState.title.trim() ||
        !formState.abstract.trim() ||
        !formState.department ||
        !formState.scholarId
      ) {
        setError("Title, abstract, department, and scholar are required.");
        setSaving(false);
        return;
      }

      const payload = new FormData();
      payload.append("title", formState.title.trim());
      payload.append("abstract", formState.abstract.trim());
      payload.append("department", formState.department);
      payload.append("scholarId", formState.scholarId);
      if (formState.file) {
        payload.append("file", formState.file);
      }

      await apiPatchForm(`/submissions/${submissionId}`, payload);
      setSuccess("Submission updated successfully.");
      setCurrentFileName(formState.file?.name ?? currentFileName);
      setFormState((prev) => ({ ...prev, file: null }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update submission";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Edit Submission"
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
          Edit submission
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your research paper details.
        </p>
        <form className="mt-6 space-y-5">
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor="title"
            >
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
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                htmlFor="department"
              >
                Department
              </label>
              <select
                id="department"
                className={inputClass}
                value={formState.department}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    department: event.target.value,
                  }))
                }
              >
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((item) => (
                  <option key={item._id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                htmlFor="file"
              >
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
              {currentFileName ? (
                <p className="mt-2 text-xs text-slate-500">
                  Current file: {currentFileName}
                </p>
              ) : null}
            </div>
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor="scholar"
            >
              Scholar
            </label>
            <select
              id="scholar"
              className={inputClass}
              value={formState.scholarId}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  scholarId: event.target.value,
                }))
              }
            >
              <option value="" disabled>
                Select scholar
              </option>
              {scholars.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              htmlFor="abstract"
            >
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
              disabled={saving || loading}
              className="rounded-full bg-[color:var(--maroon-800)] px-6 py-2 text-xs font-semibold text-white shadow-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/scholar/submissions"
              className="rounded-full border border-[color:var(--border)] px-6 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </Link>
          </div>
          {loading ? (
            <p className="text-xs text-slate-500">Loading submission...</p>
          ) : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          {success ? <p className="text-xs text-emerald-600">{success}</p> : null}
        </form>
      </section>
    </PageLayout>
  );
}
