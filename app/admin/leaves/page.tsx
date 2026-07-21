"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Eye, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import { apiGet, apiPatchJson, apiDelete, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type LeaveItem = {
  _id: string;
  leaveType: string;
  scholar: {
    _id: string;
    name: string;
    email: string;
    researchCenter?: {
      _id: string;
      name: string;
    } | null;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  guideNote?: string;
  coordinatorNote?: string;
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

export default function AdminLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions state
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [note, setNote] = useState("");
  const [actionStatus, setActionStatus] = useState<"ApprovedByCoordinator" | "Rejected" | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<ApiListResponse<LeaveItem>>("/leaves");
      setLeaves(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

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

  const handleDeleteLeave = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this leave record? This action cannot be undone.")) {
      return;
    }
    try {
      setProcessing(true);
      await apiDelete(`/leaves/${id}`);
      loadLeaves();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete leave request");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { key: "scholar", label: "Scholar Name" },
    { key: "researchCenter", label: "Research Center" },
    { key: "type", label: "Leave Type" },
    { key: "dates", label: "Duration" },
    { key: "days", label: "Days", align: "center" as const },
    { key: "status", label: "Status" },
    { key: "action", label: "Action", align: "right" as const },
  ];

  const rows = useMemo(() => {
    return leaves.map((item) => ({
      id: item._id,
      scholar: item.scholar?.name || "Unknown Scholar",
      researchCenter: item.scholar?.researchCenter?.name || "N/A",
      type: item.leaveType,
      dates: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
      days: item.totalDays,
      status: (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={item.status} />
          {item.guideNote ? (
            <span className="text-[10px] text-slate-500 max-w-[150px] truncate" title={item.guideNote}>
              Guide: {item.guideNote}
            </span>
          ) : null}
          {item.coordinatorNote ? (
            <span className="text-[10px] text-slate-500 max-w-[150px] truncate" title={item.coordinatorNote}>
              Coord: {item.coordinatorNote}
            </span>
          ) : null}
        </div>
      ),
      action: (
        <div className="flex justify-end items-center gap-2">
          {item.document?.url ? (
            <a
              href={item.document.url}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
              title="View Leave Proof"
            >
              <Eye className="h-4 w-4" />
            </a>
          ) : null}
          {item.status === "ApprovedByGuide" ? (
            <>
              <button
                onClick={() => {
                  setSelectedLeave(item);
                  setActionStatus("ApprovedByCoordinator");
                }}
                className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full cursor-pointer"
                title="Final Approve Leave"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedLeave(item);
                  setActionStatus("Rejected");
                }}
                className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full cursor-pointer"
                title="Reject Leave"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <button
            onClick={() => handleDeleteLeave(item._id)}
            className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer transition shadow-xs"
            title="Delete Leave Record"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      ),
    }));
  }, [leaves]);

  return (
    <PageLayout
      title="Overall Leaves"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Overall Leaves"
    >
      <div className="space-y-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display text-2xl font-bold text-[color:var(--maroon-900)] mt-2">
            Scholar Leaves Database
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit and manage all leave applications across all Research Centers.
          </p>
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
                {actionStatus === "ApprovedByCoordinator" ? "Final Approve Leave" : "Reject Leave Request"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scholar: <span className="font-semibold text-slate-700">{selectedLeave.scholar?.name}</span>
              </p>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
                <p><strong>Duration:</strong> {formatDate(selectedLeave.startDate)} to {formatDate(selectedLeave.endDate)} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                {selectedLeave.guideNote ? (
                  <p className="text-[color:var(--maroon-800)] font-semibold">
                    <strong>Guide Remarks:</strong> {selectedLeave.guideNote}
                  </p>
                ) : null}
              </div>

              <form onSubmit={handleAction} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="note">
                    Admin / Coordinator Note
                  </label>
                  <textarea
                    id="note"
                    placeholder="Enter approval remarks"
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
                      View Attachment
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
                      actionStatus === "ApprovedByCoordinator"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                  >
                    {processing ? "Processing..." : actionStatus === "ApprovedByCoordinator" ? "Final Approve" : "Reject Leave"}
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


