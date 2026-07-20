"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Redirecting to Admin Dashboard & User Management...
    </div>
  );
}
