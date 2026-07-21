"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoordinatorLeavesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/faculty");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
      Redirecting to dashboard...
    </div>
  );
}



