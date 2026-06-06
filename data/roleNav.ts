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
  Award,
  Calendar,
} from "lucide-react";

export const scholarNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/scholar" },
  { label: "My Submissions", icon: FileText, href: "/scholar/submissions" },
  { label: "My Portfolio", icon: Award, href: "/scholar/portfolio" },
  { label: "Leave Applications", icon: Calendar, href: "/scholar/leaves" },
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

export const researchGuideNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/research-guide" },
  { label: "Scholars", icon: Users, href: "/research-guide/scholars" },
  { label: "Submissions", icon: FileText, href: "/research-guide/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/research-guide/approvals" },
  { label: "Portfolio Reviews", icon: Award, href: "/research-guide/portfolio-reviews" },
  { label: "Leave Reviews", icon: Calendar, href: "/research-guide/leave-reviews" },
  { label: "Reports", icon: NotebookText, href: "/research-guide/reports" },
  { label: "Profile", icon: User, href: "/research-guide/profile" },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Coordinators", icon: User, href: "/admin/coordinators" },
  { label: "Departments", icon: Building2, href: "/admin/departments" },
  { label: "Research Centers", icon: Building2, href: "/admin/research-centers" },
  { label: "Submissions", icon: FileText, href: "/admin/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/admin/approvals" },
  { label: "Scholar Portfolios", icon: Award, href: "/admin/portfolios" },
  { label: "Overall Leaves", icon: Calendar, href: "/admin/leaves" },
  { label: "Reports", icon: NotebookText, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export const coordinatorNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/coordinator" },
  { label: "Departments", icon: Building2, href: "/coordinator/departments" },
  { label: "Submissions", icon: FileText, href: "/coordinator/submissions" },
  { label: "Approvals", icon: ClipboardCheck, href: "/coordinator/approvals" },
  { label: "Scholar Portfolios", icon: Award, href: "/coordinator/portfolios" },
  { label: "Department Leaves", icon: Calendar, href: "/coordinator/leaves" },
  { label: "Reports", icon: NotebookText, href: "/coordinator/reports" },
  { label: "Profile", icon: User, href: "/coordinator/profile" },
];
