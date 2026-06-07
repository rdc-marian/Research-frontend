"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { facultyNav } from "@/data/roleNav";
import { apiGet, apiPostForm, type ApiItemResponse, type ApiListResponse } from "@/lib/api";

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

function FacultyScholarDetailsContent() {
  const searchParams = useSearchParams();
  const scholarId = useMemo(() => searchParams.get("id") ?? "", [searchParams]);
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(scholarId));
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    department: "",
    abstract: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!scholarId) {
      return;
    }
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [scholarRes, submissionRes, deptsRes] = await Promise.all([
          apiGet<ApiItemResponse<Scholar>>(`/users/${scholarId}`),
          apiGet<ApiListResponse<Submission>>(`/submissions?scholarId=${scholarId}`),
          apiGet<ApiListResponse<any>>("/departments"),
        ]);
        if (!isMounted) return;
        setScholar(scholarRes.item);
        setSubmissions(submissionRes.items);
        setDepartments(deptsRes.items);
        setFormState(prev => ({
          ...prev,
          department: scholarRes.item.department || (deptsRes.items[0]?.name ?? "")
        }));
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

  const handleAddSubmission = async () => {
    if (!formState.title.trim() || !formState.department || !formState.abstract.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("title", formState.title.trim());
      payload.append("abstract", formState.abstract.trim());
      payload.append("department", formState.department);
      payload.append("scholarId", scholarId);
      if (formState.file) {
        payload.append("file", formState.file);
      }
      const newSub = await apiPostForm<any>("/submissions", payload);
      setSubmissions((prev) => [newSub, ...prev]);
      setShowAddModal(false);
      setFormState({
        title: "",
        department: scholar?.department || (departments[0]?.name ?? ""),
        abstract: "",
        file: null,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add submission.");
    } finally {
      setSaving(false);
    }
  };

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
      userName="Dr. Emily Davis"
      roleLabel="Faculty Member"
      navItems={facultyNav}
      activeItem="Scholars"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link href="/faculty/scholars" className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]">
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
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--maroon-800)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--maroon-900)] transition shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Submission
                  </button>
                </div>
                <div className="mt-4">
                  <DataTable columns={submissionColumns} rows={rows} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-[color:var(--border)]">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
              <h3 className="font-display text-base font-bold text-[#9B0302]">
                Add Submission
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Title</label>
                <input
                  type="text"
                  placeholder="Enter research title"
                  value={formState.title}
                  onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Research Center</label>
                <select
                  value={formState.department}
                  onChange={(e) => setFormState(prev => ({ ...prev, department: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">File Upload (PDF)</label>
                <input
                  type="file"
                  onChange={(e) => setFormState(prev => ({ ...prev, file: e.target.files?.[0] ?? null }))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Abstract</label>
                <textarea
                  placeholder="Enter abstract"
                  value={formState.abstract}
                  onChange={(e) => setFormState(prev => ({ ...prev, abstract: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#9B0302] min-h-[100px] resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-[color:var(--border)] pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSubmission}
                disabled={saving}
                className="px-5 py-2 rounded-full bg-[#9B0302] hover:bg-[#800201] text-xs font-semibold text-white transition disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Submission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function FacultyScholarDetailsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading...</p>}>
      <FacultyScholarDetailsContent />
    </Suspense>
  );
}
