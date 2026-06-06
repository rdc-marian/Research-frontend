type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  Pending: "border-rose-200 bg-rose-50 text-rose-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-slate-200 bg-slate-100 text-slate-600",
  "In Review": "border-amber-200 bg-amber-50 text-amber-700",
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Inactive: "border-slate-200 bg-slate-100 text-slate-500",
  ApprovedByGuide: "border-amber-200 bg-amber-50 text-amber-700",
  ApprovedByCoordinator: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
