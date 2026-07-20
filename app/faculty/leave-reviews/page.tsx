"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { getFacultyNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type LeaveItem = {
  _id: string;
  leaveType: string;
  scholar: {
    _id: string;
    name: string;
    email: string;
    researchCenter?: { name?: string };
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  guideNote?: string;
  document?: {
    url: string;
    originalName: string;
  };
  createdAt: string;
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

export default function GuideLeaveReviewsPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [note, setNote] = useState("");
  const [actionStatus, setActionStatus] = useState<"ApprovedByGuide" | "Rejected" | null>(null);
  const [processing, setProcessing] = useState(false);

  const dynamicNavItems = useMemo(() => {
    return getFacultyNav(user?.permissions);
  }, [user?.permissions]);

  const loadLeaves = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);
      // Fetch full leave history for this guide's scholars
      const res = await apiGet<ApiListResponse<LeaveItem>>(`/leaves?guideId=${user._id}`);
      
      // Sort newest requests to the top
      const sorted = [...(res.items || [])].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.startDate).getTime();
        const timeB = new Date(b.createdAt || b.startDate).getTime();
        return timeB - timeA;
      });

      setLeaves(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user?._id]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave || !actionStatus || !user?._id) return;

    try {
      setProcessing(true);
      await apiPatchJson(`/leaves/${selectedLeave._id}/status`, {
        status: actionStatus,
        reviewerId: user._id,
        note: note.trim(),
      });

      setSelectedLeave(null);
      setNote("");
      setActionStatus(null);
      loadLeaves();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update leave status");
    } finally {
      setProcessing(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    if (activeFilter === "Pending") {
      return leaves.filter((l) => l.status === "Pending");
    }
    if (activeFilter === "Approved") {
      return leaves.filter((l) => l.status === "ApprovedByGuide" || l.status === "ApprovedByCoordinator" || l.status === "Approved");
    }
    if (activeFilter === "Rejected") {
      return leaves.filter((l) => l.status === "Rejected");
    }
    return leaves;
  }, [leaves, activeFilter]);

  const counts = useMemo(() => {
    return {
      All: leaves.length,
      Pending: leaves.filter((l) => l.status === "Pending").length,
      Approved: leaves.filter((l) => l.status === "ApprovedByGuide" || l.status === "ApprovedByCoordinator" || l.status === "Approved").length,
      Rejected: leaves.filter((l) => l.status === "Rejected").length,
    };
  }, [leaves]);

  const columns = [
    { key: "scholar", label: "Scholar" },
    { key: "type", label: "Leave Type" },
    { key: "dates", label: "Duration" },
    { key: "days", label: "Days", align: "center" as const },
    { key: "reason", label: "Reason & Remarks" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action", align: "right" as const },
  ];

  const rows = useMemo(() => {
    return filteredLeaves.map((item) => ({
      id: item._id,
      scholar: (
        <div>
          <p className="font-semibold text-slate-800">{item.scholar?.name || "Scholar"}</p>
          <p className="text-[10px] text-slate-400">{item.scholar?.email}</p>
        </div>
      ),
      type: item.leaveType,
      dates: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
      days: item.totalDays,
      reason: (
        <div className="max-w-[200px]">
          <p className="truncate text-slate-700 font-medium" title={item.reason}>{item.reason}</p>
          {item.guideNote ? (
            <p className="text-[10px] text-slate-500 italic mt-0.5 truncate" title={`Guide Note: ${item.guideNote}`}>
              Remark: {item.guideNote}
            </p>
          ) : null}
        </div>
      ),
      status: <StatusBadge status={item.status} />,
      action: (
        <div className="flex justify-end items-center gap-2">
          {item.document?.url ? (
            <a
              href={item.document.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
              title="View attachment proof"
            >
              <Eye className="h-4 w-4" />
            </a>
          ) : null}
          {item.status === "Pending" ? (
            <>
              <button
                onClick={() => {
                  setSelectedLeave(item);
                  setActionStatus("ApprovedByGuide");
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                title="Approve Leave"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => {
                  setSelectedLeave(item);
                  setActionStatus("Rejected");
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition flex items-center gap-1"
                title="Reject Leave"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-50">
              Completed
            </span>
          )}
        </div>
      ),
    }));
  }, [filteredLeaves]);

  return (
    <PageLayout
      title="Leave Reviews"
      userName={user?.name || "Faculty"}
      roleLabel="Faculty Member"
      navItems={dynamicNavItems}
      activeItem="Leave Reviews"
    >
      <div className="space-y-6">
        <div>
          <Link
            href="/faculty"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-[color:var(--maroon-900)] mt-2">
            Scholar Leave History & Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage leave applications submitted by scholars under your guidance.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeFilter === filter
                  ? "bg-[#9B0302] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter} ({counts[filter]})
            </button>
          ))}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-500">Loading leave requests...</p>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}

        {/* Action Modal */}
        {selectedLeave && actionStatus ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-display text-lg font-bold text-[color:var(--maroon-900)]">
                {actionStatus === "ApprovedByGuide" ? "Approve Scholar Leave" : "Reject Scholar Leave"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scholar: <span className="font-semibold text-slate-700">{selectedLeave.scholar?.name}</span>
              </p>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
                <p><strong>Duration:</strong> {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>

              <form onSubmit={handleAction} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="note">
                    Review Remarks / Comments
                  </label>
                  <textarea
                    id="note"
                    placeholder="Enter approval note or rejection reason"
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm min-h-[80px]"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required={actionStatus === "Rejected"}
                  />
                </div>

                {selectedLeave.document?.url ? (
                  <div className="text-xs">
                    <a
                      href={selectedLeave.document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[color:var(--maroon-700)] font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <Eye className="h-4.5 w-4.5" />
                      View Attachment Proof
                    </a>
                  </div>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeave(null);
                      setActionStatus(null);
                    }}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className={`rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 ${
                      actionStatus === "ApprovedByGuide"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {processing ? "Processing..." : actionStatus === "ApprovedByGuide" ? "Approve Leave" : "Reject Leave"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}
