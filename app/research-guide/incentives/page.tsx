"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { researchGuideNav } from "@/data/roleNav";
import { getIncentives, updateIncentiveStatus, IncentiveApplication } from "@/lib/mockIncentives";
import { useAuth } from "@/components/AuthProvider";

export default function GuideIncentives() {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<IncentiveApplication[]>([]);

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

  const handleApprove = async (id: string, action: "Approve" | "Reject") => {
    try {
      const status = action === "Approve" ? "Pending Admin" : "Rejected";
      await updateIncentiveStatus(id, status);
      fetchIncentives();
    } catch (err) {
      console.error("Failed to update incentive status:", err);
      alert("Failed to update status.");
    }
  };

  const pendingList = incentives.filter(i => i.status === "Pending Guide");

  return (
    <PageLayout
      title="Incentives Approval"
      userName={user?.name || "Research Guide"}
      roleLabel="Research Guide"
      navItems={researchGuideNav}
      activeItem="Incentives"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Incentives Approval</h2>
          <p className="text-sm text-slate-500 mt-1">Review faculty incentive applications verified by the library.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Faculty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Details</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingList.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-sm font-medium text-slate-900">{inc.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{inc.facultyName}<br/><span className="text-xs text-slate-500 font-normal">{inc.facultyEmail}</span></td>
                  <td className="p-4 text-sm text-slate-700">{inc.category}</td>
                  <td className="p-4 text-sm text-slate-500">
                    {inc.category === "Publication" && inc.publicationTitle}
                    {inc.category === "Patent" && inc.patentTitle}
                    {inc.category === "Registration Fee" && inc.eventName}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleApprove(inc.id, "Approve")} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition">Approve</button>
                    <button onClick={() => handleApprove(inc.id, "Reject")} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200 transition">Reject</button>
                  </td>
                </tr>
              ))}
              {pendingList.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500 text-sm">No applications pending guide approval.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
