"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Plus, ShieldCheck, Eye, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { scholarNav } from "@/data/roleNav";
import { apiDelete, apiGet, apiPostForm, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type LeaveItem = {
  _id: string;
  leaveType: string;
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

export default function ScholarLeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadLeaves = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<ApiListResponse<LeaveItem>>(`/api/leaves?scholarId=${user._id}`);
      setLeaves(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user?._id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    if (!startDate || !endDate || !reason.trim()) {
      setFormError("All fields are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    // Calculate total days (inclusive)
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = new FormData();
      payload.append("scholarId", user._id);
      payload.append("leaveType", leaveType);
      payload.append("startDate", startDate);
      payload.append("endDate", endDate);
      payload.append("totalDays", String(totalDays));
      payload.append("reason", reason.trim());

      if (file) {
        payload.append("file", file);
      }

      await apiPostForm("/api/leaves", payload);
      setShowApplyModal(false);
      // Reset form
      setStartDate("");
      setEndDate("");
      setReason("");
      setFile(null);

      loadLeaves();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel/delete this leave request?")) return;
    try {
      await apiDelete(`/api/leaves/${id}`);
      loadLeaves();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete leave request");
    }
  };

  const totalUsed = useMemo(() => {
    return leaves
      .filter((l) => l.status === "ApprovedByCoordinator")
      .reduce((sum, current) => sum + current.totalDays, 0);
  }, [leaves]);

  const columns = [
    { key: "type", label: "Leave Type" },
    { key: "dates", label: "Duration" },
    { key: "days", label: "Days", align: "center" as const },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action", align: "right" as const },
  ];

  const rows = useMemo(() => {
    return leaves.map((item) => ({
      id: item._id,
      type: item.leaveType,
      dates: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
      days: item.totalDays,
      reason: <span className="max-w-[200px] truncate block" title={item.reason}>{item.reason}</span>,
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
        <div className="flex justify-end gap-2">
          {item.document?.url ? (
            <a
              href={item.document.url}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              title="View leave attachment proof"
            >
              <Eye className="h-4 w-4" />
            </a>
          ) : null}
          {item.status === "Pending" ? (
            <button
              onClick={() => handleDelete(item._id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
              title="Cancel request"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    }));
  }, [leaves]);

  return (
    <PageLayout
      title="Leave Applications"
      userName={user?.name || "Scholar User"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="Leave Applications"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/scholar"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-2xl font-bold text-[color:var(--maroon-900)] mt-2">
              Leave Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">Submit new leave requests and check your status.</p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Apply for Leave
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved Leaves</span>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">{totalUsed}</span>
              <span className="text-xs text-slate-500">days this semester</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Requests</span>
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">
                {leaves.filter((l) => l.status === "Pending" || l.status === "ApprovedByGuide").length}
              </span>
              <span className="text-xs text-slate-500">requests in review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-[0_10px_24px_rgba(91,11,22,0.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applications count</span>
              <FileText className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-semibold text-slate-900">{leaves.length}</span>
              <span className="text-xs text-slate-500">total applications filed</span>
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-500">Loading leave logs...</p>
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}

        {/* Apply for Leave Modal */}
        {showApplyModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <h3 className="font-display text-lg font-bold text-[color:var(--maroon-900)]">Apply for Leave</h3>
              <p className="text-xs text-slate-500 mt-1">Submit details for guide and coordinator review.</p>

              <form onSubmit={handleApply} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="leaveType">
                    Leave Type
                  </label>
                  <select
                    id="leaveType"
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Duty Leave">Duty Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="startDate">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="endDate">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="reason">
                    Reason
                  </label>
                  <textarea
                    id="reason"
                    placeholder="Enter detailed reason for leave request"
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm min-h-[80px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="file">
                    Attachment / Supporting Document (Optional)
                  </label>
                  <input
                    id="file"
                    type="file"
                    className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {formError ? <p className="text-xs text-red-600">{formError}</p> : null}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-5 py-2 text-xs font-semibold text-white transition-all duration-200"
                  >
                    {submitting ? "Submitting..." : "Apply"}
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
