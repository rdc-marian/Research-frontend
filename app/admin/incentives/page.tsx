"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { adminNav } from "@/data/roleNav";
import { getMockIncentives, saveMockIncentives, IncentiveApplication } from "@/lib/mockIncentives";
import { useAuth } from "@/components/AuthProvider";

export default function AdminIncentives() {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<IncentiveApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"Admin" | "Principal" | "Processing">("Admin");

  useEffect(() => {
    setIncentives(getMockIncentives());
  }, []);

  const handleAction = (id: string, action: "ApproveAdmin" | "Reject" | "ApprovePrincipal" | "MarkPaid") => {
    const updated = incentives.map((inc) => {
      if (inc.id === id) {
        let newStatus = inc.status;
        if (action === "Reject") newStatus = "Rejected";
        else if (action === "ApproveAdmin") newStatus = "Pending Principal";
        else if (action === "ApprovePrincipal") newStatus = "Approved";
        else if (action === "MarkPaid") newStatus = "Paid";

        return { ...inc, status: newStatus } as IncentiveApplication;
      }
      return inc;
    });
    saveMockIncentives(updated);
    setIncentives(updated);
  };

  const getFilteredList = () => {
    if (activeTab === "Admin") return incentives.filter(i => i.status === "Pending Admin");
    if (activeTab === "Principal") return incentives.filter(i => i.status === "Pending Principal");
    if (activeTab === "Processing") return incentives.filter(i => i.status === "Approved" || i.status === "Paid");
    return [];
  };

  const list = getFilteredList();

  return (
    <PageLayout
      title="Incentives Management"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Incentives"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Incentives Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review, approve, and process faculty incentives.</p>
        </div>

        <div className="flex border-b border-slate-200 gap-4 mb-6">
          <button
            onClick={() => setActiveTab("Admin")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "Admin" ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Admin Verification
          </button>
          <button
            onClick={() => setActiveTab("Principal")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "Principal" ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Principal Tab
          </button>
          <button
            onClick={() => setActiveTab("Processing")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "Processing" ? "border-[#9B0302] text-[#9B0302]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            Final Processing
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Faculty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Details</th>
                {activeTab === "Processing" && <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>}
                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-sm font-medium text-slate-900">{inc.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{inc.facultyName}<br/><span className="text-xs text-slate-500 font-normal">{inc.facultyEmail}</span></td>
                  <td className="p-4 text-sm text-slate-700">{inc.category}</td>
                  <td className="p-4 text-sm text-slate-500">
                    {inc.category === "Publication" && inc.publicationTitle}
                    {inc.category === "Patent" && inc.patentTitle}
                    {inc.category === "Registration Fee" && inc.eventName}
                  </td>
                  {activeTab === "Processing" && (
                    <td className="p-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${inc.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                        {inc.status}
                      </span>
                    </td>
                  )}
                  <td className="p-4 text-right space-x-2">
                    {activeTab === "Admin" && (
                      <>
                        <button onClick={() => handleAction(inc.id, "ApproveAdmin")} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition">Forward to Principal</button>
                        <button onClick={() => handleAction(inc.id, "Reject")} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200 transition">Reject</button>
                      </>
                    )}
                    {activeTab === "Principal" && (
                      <>
                        <button onClick={() => handleAction(inc.id, "ApprovePrincipal")} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition">Approve</button>
                        <button onClick={() => handleAction(inc.id, "Reject")} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200 transition">Reject</button>
                      </>
                    )}
                    {activeTab === "Processing" && inc.status === "Approved" && (
                      <button onClick={() => handleAction(inc.id, "MarkPaid")} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition">Mark as Paid</button>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={activeTab === "Processing" ? 6 : 5} className="p-8 text-center text-slate-500 text-sm">No applications in this tab.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
