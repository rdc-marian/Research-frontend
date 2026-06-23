"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { DashboardCards } from "@/components/DashboardCards";
import { facultyNav } from "@/data/roleNav";
import { getMockIncentives, saveMockIncentives, IncentiveApplication, IncentiveCategory } from "@/lib/mockIncentives";
import { Plus, IndianRupee, Clock, CheckCircle, FileText, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function FacultyIncentives() {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<IncentiveApplication[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [category, setCategory] = useState<IncentiveCategory>("Publication");

  // Form states
  const [amount, setAmount] = useState("");
  const [pubTitle, setPubTitle] = useState("");
  const [pubJournal, setPubJournal] = useState("");
  const [pubStatus, setPubStatus] = useState("Published");
  const [patTitle, setPatTitle] = useState("");
  const [patNumber, setPatNumber] = useState("");
  const [patStatus, setPatStatus] = useState("Granted");
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("Conference");
  const [proofImage, setProofImage] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const data = getMockIncentives();
    // Only show faculty's own incentives, assuming email matches or it's just the mocked one.
    setIncentives(data.filter(i => i.facultyEmail === (user?.email || "elizabeth.paul@univ.edu")));
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: IncentiveApplication = {
      id: "INC-" + Math.floor(Math.random() * 10000),
      facultyName: user?.name || "Dr. Elizabeth Paul",
      facultyEmail: user?.email || "elizabeth.paul@univ.edu",
      category,
      amountRequested: Number(amount),
      dateApplied: new Date().toISOString(),
      status: "Pending Library",
      proofImage,
    };

    if (category === "Publication") {
      newInc.publicationTitle = pubTitle;
      newInc.journalName = pubJournal;
      newInc.pubStatus = pubStatus;
    } else if (category === "Patent") {
      newInc.patentTitle = patTitle;
      newInc.patentNumber = patNumber;
      newInc.patentStatus = patStatus;
    } else if (category === "Registration Fee") {
      newInc.eventName = eventName;
      newInc.eventType = eventType;
    }

    const all = getMockIncentives();
    const updated = [...all, newInc];
    saveMockIncentives(updated);
    setIncentives(updated.filter(i => i.facultyEmail === newInc.facultyEmail));
    setShowApplyModal(false);
    setProofImage("");
  };

  const pendingCount = incentives.filter(i => i.status.includes("Pending")).length;
  const approvedCount = incentives.filter(i => i.status === "Approved" || i.status === "Paid").length;
  const paidAmount = incentives.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.amountRequested, 0);

  const stats = [
    { label: "Total Applications", value: incentives.length.toString(), icon: FileText },
    { label: "Pending Approvals", value: pendingCount.toString(), icon: Clock },
    { label: "Approved Incentives", value: approvedCount.toString(), icon: CheckCircle },
    { label: "Amount Received", value: `₹${paidAmount}`, icon: IndianRupee },
  ];

  return (
    <PageLayout title="Incentive Management" navItems={facultyNav} activeItem="Incentives">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Incentives</h2>
          <p className="text-sm text-slate-500">Track and manage your incentive applications.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#9B0302] text-white rounded-xl text-sm font-semibold hover:bg-[#800201] transition"
        >
          <Plus className="w-4 h-4" /> Apply for Incentive
        </button>
      </div>

      <DashboardCards items={stats} />

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Category</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Details</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date Applied</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {incentives.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-medium text-slate-900">{inc.id}</td>
                <td className="p-4 text-sm text-slate-700">{inc.category}</td>
                <td className="p-4 text-sm text-slate-500">
                  {inc.category === "Publication" && inc.publicationTitle}
                  {inc.category === "Patent" && inc.patentTitle}
                  {inc.category === "Registration Fee" && inc.eventName}
                  {inc.proofImage && (
                    <div className="mt-1">
                      <button
                        onClick={() => setShowPreviewModal(inc.proofImage || null)}
                        className="text-xs font-semibold text-[#9B0302] hover:underline"
                      >
                        View Proof Image
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm font-semibold text-slate-900">₹{inc.amountRequested}</td>
                <td className="p-4 text-sm text-slate-500">{new Date(inc.dateApplied).toLocaleDateString()}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                    inc.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                    inc.status === "Approved" ? "bg-blue-100 text-blue-800" :
                    inc.status === "Rejected" ? "bg-red-100 text-red-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
            {incentives.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Apply for Incentive</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="incForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full border rounded-xl p-2.5 text-sm">
                    <option value="Publication">Publication</option>
                    <option value="Patent">Patent</option>
                    <option value="Registration Fee">Registration Fee Reimbursement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Requested Amount (₹)</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                </div>

                {category === "Publication" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Publication Title</label>
                      <input type="text" required value={pubTitle} onChange={(e) => setPubTitle(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Journal Name</label>
                      <input type="text" required value={pubJournal} onChange={(e) => setPubJournal(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Status</label>
                      <select value={pubStatus} onChange={(e) => setPubStatus(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
                        <option value="Accepted / Indexed">Accepted / Indexed</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </>
                )}

                {category === "Patent" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Patent Title</label>
                      <input type="text" required value={patTitle} onChange={(e) => setPatTitle(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Patent Number</label>
                      <input type="text" required value={patNumber} onChange={(e) => setPatNumber(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Status</label>
                      <select value={patStatus} onChange={(e) => setPatStatus(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
                        <option value="Filed">Filed</option>
                        <option value="Published">Published</option>
                        <option value="Granted">Granted</option>
                      </select>
                    </div>
                  </>
                )}

                {category === "Registration Fee" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Event Name</label>
                      <input type="text" required value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Event Type</label>
                      <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full border rounded-xl p-2.5 text-sm">
                        <option value="Conference">Conference</option>
                        <option value="Workshop">Workshop</option>
                        <option value="FDP">FDP</option>
                        <option value="Seminar">Seminar</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Supporting Document / Proof (Image)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#9B0302]/10 file:text-[#9B0302] hover:file:bg-[#9B0302]/20 cursor-pointer"
                  />
                  {proofImage && (
                    <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                      <img src={proofImage} alt="Proof preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border rounded-xl hover:bg-slate-50">Cancel</button>
              <button type="submit" form="incForm" className="px-4 py-2 text-sm font-semibold text-white bg-[#9B0302] rounded-xl hover:bg-[#800201]">Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 relative shadow-2xl">
            <button
              onClick={() => setShowPreviewModal(null)}
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-800 p-2 bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-6 flex justify-center items-center">
              <img src={showPreviewModal} alt="Incentive Proof" className="max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
