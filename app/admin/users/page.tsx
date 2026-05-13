import { Plus, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { DataTable } from "@/components/Table";
import { StatusBadge } from "@/components/StatusBadge";
import { adminNav } from "@/data/roleNav";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "department", label: "Department" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action", align: "right" as const },
];

const rows = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@univ.edu",
    role: "Scholar",
    department: "Computer Science",
    status: <StatusBadge status="Active" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        View
      </button>
    ),
  },
  {
    id: "2",
    name: "Emily Davis",
    email: "emily.davis@univ.edu",
    role: "Faculty / Guide",
    department: "Information Tech",
    status: <StatusBadge status="Active" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        View
      </button>
    ),
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@univ.edu",
    role: "Scholar",
    department: "Electronics",
    status: <StatusBadge status="Inactive" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        View
      </button>
    ),
  },
  {
    id: "4",
    name: "Priya Sharma",
    email: "priya.sharma@univ.edu",
    role: "Research Center Coordinator",
    department: "MCA - Master of Computer Applications",
    status: <StatusBadge status="Active" />,
    action: (
      <button
        type="button"
        className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--maroon-700)]"
      >
        View
      </button>
    ),
  },
];

export default function AdminUsersPage() {
  return (
    <PageLayout
      title="Users"
      userName="Admin"
      roleLabel="Administrator"
      navItems={adminNav}
      activeItem="Users"
    >
      <section className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--border)] pb-4">
          <div>
            <h2 className="font-display text-lg text-[color:var(--maroon-900)]">
              Users
            </h2>
            <p className="text-sm text-slate-500">
              Manage scholars, faculty, coordinators, and admin accounts.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--maroon-800)] px-4 py-2 text-xs font-semibold text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs text-slate-500">
            <Search className="h-4 w-4" />
            <span>Search users...</span>
          </div>
          <select className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            <option>All Roles</option>
            <option>Scholar</option>
            <option>Faculty</option>
            <option>Research Center Coordinator</option>
            <option>Admin</option>
          </select>
        </div>
        <div className="mt-4">
          <DataTable columns={columns} rows={rows} />
        </div>
      </section>
    </PageLayout>
  );
}
