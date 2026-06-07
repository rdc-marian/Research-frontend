"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import {
  apiGet,
  apiPatchJson,
  type ApiItemResponse,
  type ApiListResponse,
} from "@/lib/api";

type ResearchCenter = {
  _id: string;
  name: string;
  code: string;
  status?: string;
  coordinator?: { _id?: string; name?: string; email?: string } | null;
  department?: { name?: string } | null;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  roles?: string[];
  status?: string;
  guide?: { _id?: string; name?: string } | null;
};

type Submission = {
  _id: string;
  title: string;
  status: string;
  submittedAt?: string;
  scholar?: { name?: string } | null;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-slate-700 shadow-sm";

const guideColumns = [
  { key: "name", label: "Research Guide" },
  { key: "email", label: "Email" },
  { key: "roles", label: "Roles" },
];

const scholarColumns = [
  { key: "name", label: "Scholar" },
  { key: "email", label: "Email" },
  { key: "guide", label: "Guide" },
  { key: "status", label: "Status" },
];

const submissionColumns = [
  { key: "title", label: "Title" },
  { key: "scholar", label: "Scholar" },
  { key: "submitted", label: "Submitted On" },
  { key: "status", label: "Status", align: "right" as const },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  coordinator: "Research Center Coordinator",
  faculty: "Faculty",
  scholar: "Scholar",
  research_guide: "Research Guide",
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

export default function AdminResearchCenterDetailsPage() {
  const params = useParams();
  const centerId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const [center, setCenter] = useState<ResearchCenter | null>(null);
  const [guides, setGuides] = useState<User[]>([]);
  const [scholars, setScholars] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [coordinators, setCoordinators] = useState<User[]>([]);
  const [guideCandidates, setGuideCandidates] = useState<User[]>([]);
  const [scholarCandidates, setScholarCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    coordinatorId: "",
    guideId: "",
    scholarId: "",
    scholarGuideId: "",
  });

  const loadCenterData = useCallback(async () => {
    if (!centerId) return;
    setLoading(true);
    setError(null);

    try {
      const [centerRes, guidesRes, scholarsRes, submissionsRes] =
        await Promise.all([
          apiGet<ApiItemResponse<ResearchCenter>>(
            `/research-centers/${centerId}`
          ),
          apiGet<ApiListResponse<User>>(`/research-centers/${centerId}/guides`),
          apiGet<ApiListResponse<User>>(
            `/users?role=scholar&researchCenterId=${centerId}`
          ),
          apiGet<ApiListResponse<Submission>>(
            `/submissions?researchCenterId=${centerId}`
          ),
        ]);

      setCenter(centerRes.item);
      setGuides(guidesRes.items);
      setScholars(scholarsRes.items);
      setSubmissions(submissionsRes.items);
      setFormState((prev) => ({
        ...prev,
        coordinatorId: centerRes.item.coordinator?._id ?? "",
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load research center";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [centerId]);

  useEffect(() => {
    if (!centerId) return;
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [centerRes, guidesRes, scholarsRes, submissionsRes, coordinatorsRes, guideCandidatesRes, scholarCandidatesRes] =
          await Promise.all([
            apiGet<ApiItemResponse<ResearchCenter>>(
              `/research-centers/${centerId}`
            ),
            apiGet<ApiListResponse<User>>(`/research-centers/${centerId}/guides`),
            apiGet<ApiListResponse<User>>(
              `/users?role=scholar&researchCenterId=${centerId}`
            ),
            apiGet<ApiListResponse<Submission>>(
              `/submissions?researchCenterId=${centerId}`
            ),
            apiGet<ApiListResponse<User>>("/users?role=coordinator"),
            apiGet<ApiListResponse<User>>("/users?roles=faculty,research_guide"),
            apiGet<ApiListResponse<User>>("/users?role=scholar"),
          ]);

        if (!isMounted) return;

        setCenter(centerRes.item);
        setGuides(guidesRes.items);
        setScholars(scholarsRes.items);
        setSubmissions(submissionsRes.items);
        setCoordinators(coordinatorsRes.items);
        setGuideCandidates(guideCandidatesRes.items);
        setScholarCandidates(scholarCandidatesRes.items);
        setFormState((prev) => ({
          ...prev,
          coordinatorId: centerRes.item.coordinator?._id ?? "",
        }));
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load research center";
        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [centerId]);

  const handleCoordinatorAssign = async () => {
    if (!centerId) return;
    if (!formState.coordinatorId) {
      setSaveMessage("Select a coordinator to assign.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);
      await apiPatchJson(`/research-centers/${centerId}`, {
        coordinatorId: formState.coordinatorId,
      });
      await loadCenterData();
      setSaveMessage("Coordinator updated.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update coordinator";
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleGuideAssign = async () => {
    if (!centerId) return;
    if (!formState.guideId) {
      setSaveMessage("Select a guide to assign.");
      return;
    }

    const guide = guideCandidates.find((item) => item._id === formState.guideId);
    if (!guide) {
      setSaveMessage("Selected guide not found.");
      return;
    }

    const currentRoles = guide.roles && guide.roles.length > 0
      ? guide.roles
      : guide.role
        ? [guide.role]
        : [];
    const nextRoles = Array.from(new Set([...currentRoles, "research_guide"]));

    try {
      setSaving(true);
      setSaveMessage(null);
      await apiPatchJson(`/users/${guide._id}`, {
        researchCenterId: centerId,
        roles: nextRoles,
      });
      await loadCenterData();
      setSaveMessage("Research guide assigned.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign research guide";
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleScholarAssign = async () => {
    if (!centerId) return;
    if (!formState.scholarId || !formState.scholarGuideId) {
      setSaveMessage("Select both a scholar and a guide.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);
      await apiPatchJson(`/users/${formState.scholarId}`, {
        guideId: formState.scholarGuideId,
        researchCenterId: centerId,
      });
      await loadCenterData();
      setSaveMessage("Scholar assigned to guide.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to assign scholar";
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const guideRows = useMemo(
    () =>
      guides.map((guide) => ({
        id: guide._id,
        name: guide.name,
        email: guide.email,
        roles: (guide.roles ?? (guide.role ? [guide.role] : []))
          .map((role) => roleLabels[role] ?? role)
          .join(", ") || "N/A",
      })),
    [guides]
  );

  const scholarRows = useMemo(
    () =>
      scholars.map((scholar) => ({
        id: scholar._id,
        name: scholar.name,
        email: scholar.email,
        guide: scholar.guide?.name ?? "Unassigned",
        status: <StatusBadge status={scholar.status ?? "Active"} />,
      })),
    [scholars]
  );

  const submissionRows = useMemo(
    () =>
      submissions.map((submission) => ({
        id: submission._id,
        title: submission.title,
        scholar: submission.scholar?.name ?? "Unknown",
        submitted: formatDate(submission.submittedAt),
        status: <StatusBadge status={submission.status} />,
      })),
    [submissions]
  );

  return (
    <PageLayout
      title="Research Center"
      userName="Admin"
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Research Centers"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <Link
          href="/admin/research-centers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research Centers
        </Link>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading research center...</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : center ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--maroon-700)]">
                Research Center
              </p>
              <h2 className="mt-2 font-display text-xl text-[color:var(--maroon-900)]">
                {center.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                <span>Code: {center.code}</span>
                <span>
                  Coordinator: {center.coordinator?.name ?? "Unassigned"}
                </span>
                <span>Status: {center.status ?? "Active"}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assign coordinator
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <select
                  className={inputClass}
                  value={formState.coordinatorId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      coordinatorId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select coordinator</option>
                  {coordinators.map((coordinator) => (
                    <option key={coordinator._id} value={coordinator._id}>
                      {coordinator.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCoordinatorAssign}
                  disabled={saving}
                  className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Assign"}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assign research guide
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <select
                  className={inputClass}
                  value={formState.guideId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      guideId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select guide</option>
                  {guideCandidates.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleGuideAssign}
                  disabled={saving}
                  className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Assign"}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assign scholar to guide
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_2fr_1fr]">
                <select
                  className={inputClass}
                  value={formState.scholarId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      scholarId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select scholar</option>
                  {scholarCandidates.map((scholar) => (
                    <option key={scholar._id} value={scholar._id}>
                      {scholar.name}
                    </option>
                  ))}
                </select>
                <select
                  className={inputClass}
                  value={formState.scholarGuideId}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      scholarGuideId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select guide</option>
                  {guides.map((guide) => (
                    <option key={guide._id} value={guide._id}>
                      {guide.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleScholarAssign}
                  disabled={saving}
                  className="rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Assign"}
                </button>
              </div>
            </div>
            {saveMessage ? (
              <p className="text-xs text-slate-600">{saveMessage}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h3 className="font-display text-lg text-[color:var(--maroon-900)]">
          Research Guides
        </h3>
        <div className="mt-4">
          <DataTable columns={guideColumns} rows={guideRows} />
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h3 className="font-display text-lg text-[color:var(--maroon-900)]">
          Scholars
        </h3>
        <div className="mt-4">
          <DataTable columns={scholarColumns} rows={scholarRows} />
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h3 className="font-display text-lg text-[color:var(--maroon-900)]">
          Submissions
        </h3>
        <div className="mt-4">
          <DataTable columns={submissionColumns} rows={submissionRows} />
        </div>
      </section>
    </PageLayout>
  );
}
