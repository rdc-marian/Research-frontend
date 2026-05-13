import { Plus, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";

const columns = [
  { key: "name", label: "Coordinator" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

const rows = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.sharma@univ.edu",
    department: "MCA - Master of Computer Applications",
    status: <StatusBadge status="Active" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        Manage
      </button>
    ),
  },
  {
    id: "2",
    name: "Kiran Nair",
    email: "kiran.nair@univ.edu",
    department: "BCA - Bachelor of Computer Applications",
    status: <StatusBadge status="Active" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        Manage
      </button>
    ),
  },
  {
    id: "3",
    name: "Anita George",
    email: "anita.george@univ.edu",
    department: "Electronics",
    status: <StatusBadge status="Inactive" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        Manage
      </button>
    ),
  },
];

export default function AdminCoordinatorsPage() {
  return (
    <PageLayout
      title="Research Center Coordinators"
      userName="Admin"
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Coordinators"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
              Coordinators
            </h2>
            <p className="text-sm text-slate-500">
              Add and manage research center coordinators for each department.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Coordinator
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <span>Search coordinators...</span>
          </div>
          <select className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="mt-4">
          <DataTable columns={columns} rows={rows} />
        </div>
      </section>
    </PageLayout>
  );
}
