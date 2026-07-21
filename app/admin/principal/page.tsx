"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { adminNav } from "@/data/roleNav";
import { getIncentives, updateIncentiveStatus, deleteIncentive, IncentiveApplication, IncentiveStatus } from "@/lib/mockIncentives";
import { useAuth } from "@/components/AuthProvider";
import { ProfileImageModal, type ProfileUser } from "@/components/ProfileImageModal";
import { IncentiveProofModal } from "@/components/IncentiveProofModal";
import { CheckCircle, Clock, FileText, IndianRupee, X, Eye, ShieldCheck, XCircle, Trash2, Paperclip } from "lucide-react";

export default function PrincipalApprovals() {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<IncentiveApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"Pending" | "History">("Pending");
  const [selectedProfileUser, setSelectedProfileUser] = useState<ProfileUser | null>(null);
  const [selectedProofItem, setSelectedProofItem] = useState<IncentiveApplication | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchIncentives = async () => {
    try {
      const data = await getIncentives();
      setIncentives(data);
    } catch (err) {
      console.error("Failed to fetch incentives:", err);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handleAction = async (id: string, action: "ApprovePrincipal" | "Reject") => {
    try {
      setActionLoading(id);
      let newStatus: IncentiveStatus = action === "ApprovePrincipal" ? "Approved" : "Rejected";
      await updateIncentiveStatus(id, newStatus);
      await fetchIncentives();
    } catch (err) {
      console.error("Failed to update incentive status:", err);
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this incentive record? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoading(id);
      await deleteIncentive(id);
      await fetchIncentives();
    } catch (err) {
      console.error("Failed to delete incentive:", err);
      alert("Failed to delete incentive record.");
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredList = () => {
    if (activeTab === "Pending") return incentives.filter((i) => i.status === "Pending Principal");
    if (activeTab === "History")
      return incentives.filter((i) => i.status === "Approved" || i.status === "Paid" || i.status === "Rejected");
    return [];
  };

  const list = getFilteredList();

  const pendingCount = incentives.filter((i) => i.status === "Pending Principal").length;
  const historyCount = incentives.filter((i) => i.status === "Approved" || i.status === "Paid" || i.status === "Rejected").length;

  return (
    <PageLayout
      title="Principal Approvals"
      userName={user?.name || "Principal"}
      roleLabel="Principal / Executive Administrator"
      navItems={adminNav}
      activeItem="Principal Approvals"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Principal Incentive Approvals</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Review research incentive applications, inspect supporting files, and grant final sanctions.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-4 mb-6">
          <button
            onClick={() => setActiveTab("Pending")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "Pending"
                ? "border-[#9B0302] text-[#9B0302] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Pending Principal Approvals</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "Pending" ? "bg-[#9B0302] text-white" : "bg-slate-100 text-slate-600"}`}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("History")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === "History"
                ? "border-[#9B0302] text-[#9B0302] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>History & Past Decisions</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === "History" ? "bg-[#9B0302] text-white" : "bg-slate-100 text-slate-600"}`}>
              {historyCount}
            </span>
          </button>
        </div>

        {/* Incentive Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Details</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Application Details</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attached File</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Applied</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((inc) => {
                  const avatarUrl = inc.facultyAvatar;
                  const hasAttachment = Boolean(inc.proofImage || inc.doiLink);

                  return (
                    <tr key={inc.id} className="hover:bg-slate-50 transition duration-150">
                      {/* Faculty Info with Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() =>
                              setSelectedProfileUser({
                                name: inc.facultyName,
                                email: inc.facultyEmail,
                                role: "faculty",
                                avatar: avatarUrl,
                                department: inc.department,
                                researchCenter: inc.researchCenter,
                              })
                            }
                            className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-[#9B0302] hover:scale-105 transition-all shadow-sm"
                            title="Click to view profile photo"
                          >
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={inc.facultyName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-slate-600">
                                {inc.facultyName.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{inc.facultyName}</div>
                            <div className="text-xs text-slate-500">{inc.facultyEmail}</div>
                            {inc.department && (
                              <div className="text-[10px] text-slate-400 font-medium">{inc.department}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {inc.category}
                        </span>
                      </td>

                      {/* Application Details */}
                      <td className="p-4 text-xs text-slate-600 max-w-[220px]">
                        {inc.category === "Publication" && (
                          <div>
                            <div className="font-medium text-slate-800 line-clamp-2">{inc.publicationTitle}</div>
                            {inc.journalName && <div className="text-slate-400 mt-0.5">{inc.journalName}</div>}
                          </div>
                        )}
                        {inc.category === "Patent" && (
                          <div>
                            <div className="font-medium text-slate-800">{inc.patentTitle}</div>
                            {inc.patentNumber && <div className="text-slate-400 mt-0.5">No: {inc.patentNumber}</div>}
                          </div>
                        )}
                        {inc.category === "Registration Fee" && (
                          <div>
                            <div className="font-medium text-slate-800">{inc.eventName}</div>
                            {inc.eventType && <div className="text-slate-400 mt-0.5">{inc.eventType}</div>}
                          </div>
                        )}
                      </td>

                      {/* Attached File Option */}
                      <td className="p-4 whitespace-nowrap">
                        {hasAttachment ? (
                          <button
                            onClick={() => setSelectedProofItem(inc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9B0302]/10 text-[#9B0302] hover:bg-[#9B0302]/20 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                            title="Click to view full attached proof document"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> View Attached File
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No File</span>
                        )}
                      </td>

                      {/* Amount Requested */}
                      <td className="p-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">₹{inc.amountRequested.toLocaleString("en-IN")}</span>
                      </td>

                      {/* Date Applied */}
                      <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(inc.dateApplied).toLocaleDateString("en-GB")}
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                            inc.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inc.status === "Approved"
                              ? "bg-blue-100 text-blue-800"
                              : inc.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === "Pending" && (
                            <>
                              <button
                                onClick={() => handleAction(inc.id, "ApprovePrincipal")}
                                disabled={actionLoading === inc.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-xs disabled:opacity-60 cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" /> Approve Incentive
                              </button>
                              <button
                                onClick={() => handleAction(inc.id, "Reject")}
                                disabled={actionLoading === inc.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg hover:bg-amber-200 transition disabled:opacity-60 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(inc.id)}
                            disabled={actionLoading === inc.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold rounded-lg transition disabled:opacity-60 cursor-pointer"
                            title="Delete this incentive record permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {list.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                      No applications found in this tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Incentive Proof Modal */}
      <IncentiveProofModal
        isOpen={!!selectedProofItem}
        onClose={() => setSelectedProofItem(null)}
        proofUrl={selectedProofItem?.proofImage || null}
        title={`Attached Proof: ${selectedProofItem?.facultyName || 'Incentive Application'}`}
        doiLink={selectedProofItem?.doiLink}
      />

      {/* Profile Image Modal */}
      <ProfileImageModal
        isOpen={!!selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        user={selectedProfileUser}
      />
    </PageLayout>
  );
}

