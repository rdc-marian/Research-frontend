import type { NavItem } from "@/components/Sidebar";
import {
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  NotebookText,
  Settings,
  User,
  Users,
} from "lucide-react";

export const scholarNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/scholar" },
  { label: "My Submissions", icon: FileText, href: "/scholar/submissions" },
  { label: "My Approvals", icon: ClipboardCheck, href: "/scholar/approvals" },
  { label: "Profile", icon: User, href: "/scholar/profile" },
];

export const facultyNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/faculty" },
  { label: "Scholars", icon: Users, href: "/faculty/scholars" },
  { label: "Submissions", icon: FileText, href: "/faculty/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/faculty/approvals" },
  { label: "Reports", icon: NotebookText, href: "/faculty/reports" },
  { label: "Profile", icon: User, href: "/faculty/profile" },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Coordinators", icon: User, href: "/admin/coordinators" },
  { label: "Departments", icon: Building2, href: "/admin/departments" },
  { label: "Submissions", icon: FileText, href: "/admin/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/admin/approvals" },
  { label: "Reports", icon: NotebookText, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export const coordinatorNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/coordinator" },
  { label: "Departments", icon: Building2, href: "/coordinator/departments" },
  { label: "Submissions", icon: FileText, href: "/coordinator/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/coordinator/approvals" },
  { label: "Reports", icon: NotebookText, href: "/coordinator/reports" },
  { label: "Profile", icon: User, href: "/coordinator/profile" },
];
