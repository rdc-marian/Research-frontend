"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/faculty");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center text-xs text-slate-500">
      Redirecting to dashboard...
    </div>
  );
}
