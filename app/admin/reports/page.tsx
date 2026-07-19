"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ClipboardCheck,
  FileText,
  XCircle,
  Award,
  BookOpen,
  Calendar,
} from "lucide-react";
import { DashboardCards } from "@/components/DashboardCards";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type ReportSummary = {
  total: number;
  byStatus: {
    Pending: number;
    Approved: number;
    Rejected: number;
    "In Review"?: number;
    ApprovedByGuide?: number;
    ApprovedByCoordinator?: number;
  };
};

type ResearchCenter = {
  _id: string;
  name: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-slate-600 shadow-sm";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [researchCenterId, setResearchCenterId] = useState("");
  const [researchCenters, setResearchCenters] = useState<ResearchCenter[]>([]);
  const [reportType, setReportType] = useState("Submission Summary");

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [listItems, setListItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReportData = useCallback(
    async (type: string, from?: string, to?: string, researchCenterId?: string) => {
      const searchParams = new URLSearchParams();
      if (from) searchParams.set("from", from);
      if (to) searchParams.set("to", to);
      if (researchCenterId) searchParams.set("researchCenterId", researchCenterId);

      const suffix = searchParams.toString();

      if (type === "Submission Summary") {
        const path = suffix ? `/reports/summary?${suffix}` : "/reports/summary";
        const res = await apiGet<ReportSummary>(path);
        setSummary(res);
        setListItems([]);
      } else {
        const pathMap: Record<string, string> = {
          "Publications Registry": "/publications",
          "Patents Registry": "/patents",
          "Leaves Summary": "/leaves",
        };
        const path = pathMap[type] + (suffix ? `?${suffix}` : "");
        const res = await apiGet<{ items: any[] }>(path);

        const items = res.items;
        const counts = { Pending: 0, Approved: 0, Rejected: 0 };
        items.forEach((item) => {
          const status = item.verificationStatus || item.status;
          if (status === "Approved" || status === "ApprovedByCoordinator") {
            counts.Approved++;
          } else if (status === "Rejected") {
            counts.Rejected++;
          } else {
            counts.Pending++;
          }
        });

        setSummary({
          total: items.length,
          byStatus: counts,
        });
        setListItems(items);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryResponse, researchCentersResponse] = await Promise.all([
          loadReportData(reportType, fromDate, toDate, researchCenterId),
          apiGet<{ items: ResearchCenter[] }>("/research-centers"),
        ]);

        if (!isMounted) return;
        setResearchCenters(researchCentersResponse.items);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [reportType, loadReportData]);

  const metrics = useMemo(() => {
    const total = summary?.total ?? 0;
    const iconMap: Record<string, any> = {
      "Submission Summary": FileText,
      "Publications Registry": BookOpen,
      "Patents Registry": Award,
      "Leaves Summary": Calendar,
    };
    const currentIcon = iconMap[reportType] || FileText;

    return [
      { label: `Total ${reportType.split(" ")[0]}`, value: `${total}`, icon: currentIcon },
      {
        label: "Pending",
        value: `${summary?.byStatus?.Pending ?? 0}`,
        icon: ClipboardCheck,
      },
      {
        label: "Approved",
        value: `${summary?.byStatus?.Approved ?? 0}`,
        icon: CheckCircle,
      },
      {
        label: "Rejected",
        value: `${summary?.byStatus?.Rejected ?? 0}`,
        icon: XCircle,
      },
    ];
  }, [summary, reportType]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadReportData(reportType, fromDate || undefined, toDate || undefined, researchCenterId || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const listColumns = useMemo(() => {
    if (reportType === "Publications Registry") {
      return [
        { key: "scholar", label: "Scholar" },
        { key: "researchCenter", label: "Research Center" },
        { key: "title", label: "Title" },
        { key: "journal", label: "Journal" },
        { key: "date", label: "Publish Date" },
        { key: "status", label: "Status", align: "right" as const },
      ];
    } else if (reportType === "Patents Registry") {
      return [
        { key: "scholar", label: "Scholar" },
        { key: "researchCenter", label: "Research Center" },
        { key: "title", label: "Title" },
        { key: "appNo", label: "App Number" },
        { key: "status", label: "Patent Status" },
        { key: "verification", label: "Status", align: "right" as const },
      ];
    } else if (reportType === "Leaves Summary") {
      return [
        { key: "scholar", label: "Scholar" },
        { key: "researchCenter", label: "Research Center" },
        { key: "type", label: "Leave Type" },
        { key: "days", label: "Days", align: "center" as const },
        { key: "status", label: "Status", align: "right" as const },
      ];
    }
    return [];
  }, [reportType]);

  const listRows = useMemo(() => {
    return listItems.map((item) => {
      const formatDateStr = (d?: string) => {
        if (!d) return "N/A";
        return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      };

      if (reportType === "Publications Registry") {
        return {
          id: item._id,
          scholar: item.scholar?.name || "Unknown",
          researchCenter: item.scholar?.researchCenter?.name || "N/A",
          title: item.title,
          journal: item.journalName,
          date: formatDateStr(item.publishDate),
          status: <StatusBadge status={item.verificationStatus} />,
        };
      } else if (reportType === "Patents Registry") {
        return {
          id: item._id,
          scholar: item.scholar?.name || "Unknown",
          researchCenter: item.scholar?.researchCenter?.name || "N/A",
          title: item.title,
          appNo: item.applicationNumber,
          status: item.patentStatus,
          verification: <StatusBadge status={item.verificationStatus} />,
        };
      } else {
        return {
          id: item._id,
          scholar: item.scholar?.name || "Unknown",
          researchCenter: item.scholar?.researchCenter?.name || "N/A",
          type: item.leaveType,
          days: item.totalDays,
          status: <StatusBadge status={item.status} />,
        };
      }
    });
  }, [listItems, reportType]);

  return (
    <PageLayout
      title="Reports"
      userName={user?.name || "Admin"}
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Reports"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <h2 className="font-display text-lg text-[color:var(--maroon-900)] font-bold">
          Reports
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Institution-wide submission analytics, achievements registry, and leaves summaries.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              From date
            </label>
            <input
              type="date"
              className={inputClass}
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              To date
            </label>
            <input
              type="date"
              className={inputClass}
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Research Center
            </label>
            <select
              className={inputClass}
              value={researchCenterId}
              onChange={(event) => setResearchCenterId(event.target.value)}
            >
              <option value="">All Research Centers</option>
              {researchCenters.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Report type
            </label>
            <select
              className={inputClass}
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="Submission Summary">Submission Summary</option>
              <option value="Publications Registry">Publications Registry</option>
              <option value="Patents Registry">Patents Registry</option>
              <option value="Leaves Summary">Leaves Summary</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-6 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200"
            onClick={handleGenerate}
          >
            Generate Report
          </button>
        </div>

        <div className="mt-6">
          <DashboardCards items={metrics} />
          {error ? (
            <p className="mt-3 text-sm text-red-600">Failed to load report: {error}</p>
          ) : null}
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading report data...</p>
          ) : null}
        </div>

        {!loading && !error && reportType !== "Submission Summary" ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[color:var(--maroon-900)] mb-3 font-bold">
              Approved & Pending {reportType.split(" ")[0]} Registry
            </h3>
            <DataTable columns={listColumns} rows={listRows} />
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
}
