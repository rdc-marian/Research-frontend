"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { apiPostJson } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiPostJson<{ token: string; user: any }>("/auth/login", {
        email,
        password,
      });

      login(response.token, response.user);
      
      // Role-based redirect
      const primaryRole = response.user.role;
      if (primaryRole === "admin") router.push("/admin");
      else if (primaryRole === "coordinator") router.push("/coordinator");
      else if (primaryRole === "faculty") router.push("/faculty");
      else if (primaryRole === "research_guide") router.push("/research-guide");
      else if (primaryRole === "scholar") router.push("/scholar");
      else router.push("/");

    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--paper)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-[0_14px_28px_rgba(91,11,22,0.08)]">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--maroon-800)] text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-[color:var(--maroon-900)]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to the Research Management System
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[color:var(--maroon-600)] focus:ring-1 focus:ring-[color:var(--maroon-600)]"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-[color:var(--maroon-600)] focus:ring-1 focus:ring-[color:var(--maroon-600)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-[color:var(--maroon-800)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--maroon-900)] disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
