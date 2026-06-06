"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Plus, Trash2, Eye } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { scholarNav } from "@/data/roleNav";
import { apiDelete, apiGet, type ApiListResponse } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type PortfolioItem = {
  _id: string;
  verificationStatus: string;
  guideNote?: string;
  document?: {
    url: string;
    originalName: string;
  };
  [key: string]: any;
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

const categoryConfigs: Record<
  string,
  {
    title: string;
    desc: string;
    apiPath: string;
    columns: Array<{ key: string; label: string; align?: "left" | "center" | "right" }>;
    mapRow: (item: PortfolioItem) => Record<string, any>;
  }
> = {
  qualifications: {
    title: "Qualifications",
    desc: "Your academic background and degrees.",
    apiPath: "/api/qualifications",
    columns: [
      { key: "degree", label: "Degree" },
      { key: "subject", label: "Subject" },
      { key: "institution", label: "Institution" },
      { key: "yearOfPassing", label: "Year" },
      { key: "status", label: "Status" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      degree: item.degree,
      subject: item.subject,
      institution: item.institution,
      yearOfPassing: item.yearOfPassing,
      status: item.status,
    }),
  },
  publications: {
    title: "Publications",
    desc: "Your research publications in journals, books, etc.",
    apiPath: "/api/publications",
    columns: [
      { key: "title", label: "Title" },
      { key: "authors", label: "Authors" },
      { key: "journalName", label: "Journal/Book" },
      { key: "publishDate", label: "Publish Date" },
      { key: "indexing", label: "Indexing" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      title: item.title,
      authors: item.authors,
      journalName: item.journalName,
      publishDate: formatDate(item.publishDate),
      indexing: Array.isArray(item.indexing) ? item.indexing.join(", ") : String(item.indexing || "Other"),
    }),
  },
  conferences: {
    title: "Conferences",
    desc: "Your conference attendances and paper presentations.",
    apiPath: "/api/conferences",
    columns: [
      { key: "title", label: "Conference" },
      { key: "paperTitle", label: "Paper Title" },
      { key: "presentationType", label: "Type" },
      { key: "venue", label: "Venue" },
      { key: "dates", label: "Dates" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      title: item.title,
      paperTitle: item.paperTitle || "N/A",
      presentationType: item.presentationType,
      venue: item.venue,
      dates: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
    }),
  },
  patents: {
    title: "Patents",
    desc: "Patents filed, published, or granted.",
    apiPath: "/api/patents",
    columns: [
      { key: "title", label: "Title" },
      { key: "applicationNumber", label: "App Number" },
      { key: "patentStatus", label: "Patent Status" },
      { key: "filingDate", label: "Filing Date" },
      { key: "inventors", label: "Inventors" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      title: item.title,
      applicationNumber: item.applicationNumber,
      patentStatus: item.patentStatus,
      filingDate: formatDate(item.filingDate),
      inventors: item.inventors,
    }),
  },
  workshops: {
    title: "Workshops & FDPs",
    desc: "Seminars, workshops, FDPs organized or attended.",
    apiPath: "/api/workshops",
    columns: [
      { key: "title", label: "Workshop Title" },
      { key: "role", label: "Role" },
      { key: "organizer", label: "Organizer" },
      { key: "venue", label: "Venue" },
      { key: "dates", label: "Dates" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      title: item.title,
      role: item.role,
      organizer: item.organizer,
      venue: item.venue,
      dates: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
    }),
  },
  memberships: {
    title: "Memberships",
    desc: "Your professional body memberships.",
    apiPath: "/api/memberships",
    columns: [
      { key: "professionalBody", label: "Professional Body" },
      { key: "membershipNumber", label: "Membership No." },
      { key: "membershipType", label: "Type" },
      { key: "dates", label: "Membership Dates" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      professionalBody: item.professionalBody,
      membershipNumber: item.membershipNumber,
      membershipType: item.membershipType || "N/A",
      dates: `${formatDate(item.startDate)}${item.expiryDate ? ` - ${formatDate(item.expiryDate)}` : " (Ongoing)"}`,
    }),
  },
  scholarships: {
    title: "Scholarships & Fellowships",
    desc: "Fellowship awards, grants, and stipends.",
    apiPath: "/api/scholarships",
    columns: [
      { key: "name", label: "Fellowship Name" },
      { key: "sponsoringAgency", label: "Sponsoring Agency" },
      { key: "amount", label: "Amount / Month" },
      { key: "dates", label: "Duration" },
      { key: "scholarshipStatus", label: "Scholarship Status" },
      { key: "verificationStatus", label: "Status" },
      { key: "action", label: "Action", align: "right" },
    ],
    mapRow: (item) => ({
      name: item.name,
      sponsoringAgency: item.sponsoringAgency,
      amount: `₹${Number(item.amountPerMonth).toLocaleString("en-IN")}`,
      dates: `${formatDate(item.startDate)}${item.endDate ? ` - ${formatDate(item.endDate)}` : " (Ongoing)"}`,
      scholarshipStatus: item.scholarshipStatus,
    }),
  },
};

export default function ScholarPortfolioCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const category = (params.category as string) || "";
  const config = categoryConfigs[category];

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user?._id || !config) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<ApiListResponse<PortfolioItem>>(
        `${config.apiPath}?scholarId=${user._id}`
      );
      setItems(res.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load details";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?._id, category]);

  const handleDelete = async (id: string) => {
    if (!config || !window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiDelete(`${config.apiPath}/${id}`);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const rows = useMemo(() => {
    if (!config) return [];
    return items.map((item) => {
      const baseRow = config.mapRow(item);
      return {
        id: item._id,
        ...baseRow,
        verificationStatus: (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={item.verificationStatus} />
            {item.guideNote ? (
              <span className="text-[10px] text-slate-500 max-w-[150px] truncate" title={item.guideNote}>
                Note: {item.guideNote}
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
                title="View document proof"
              >
                <Eye className="h-4 w-4" />
              </a>
            ) : null}
            <Link
              href={`/scholar/portfolio/${category}/form?id=${item._id}`}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
              title="Edit item"
            >
              <Edit2 className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDelete(item._id)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
              title="Delete item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      };
    });
  }, [items, config, category]);

  if (!config) {
    return (
      <PageLayout
        title="Error"
        userName={user?.name || ""}
        roleLabel="Scholar"
        navItems={scholarNav}
        activeItem="My Portfolio"
      >
        <p className="text-red-600">Invalid portfolio category.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={config.title}
      userName={user?.name || "Scholar User"}
      roleLabel="Scholar"
      navItems={scholarNav}
      activeItem="My Portfolio"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/scholar/portfolio"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--maroon-700)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>
            <h1 className="font-display text-2xl font-bold text-[color:var(--maroon-900)] mt-2">
              {config.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{config.desc}</p>
          </div>

          <Link
            href={`/scholar/portfolio/${category}/form`}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] hover:bg-[color:var(--maroon-900)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add {config.title.replace(/s$/, "")}
          </Link>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <p className="text-sm text-slate-500">Loading accomplishments...</p>
        ) : (
          <DataTable columns={config.columns} rows={rows} />
        )}
      </div>
    </PageLayout>
  );
}
