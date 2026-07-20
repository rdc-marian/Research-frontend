"use client";

import { X, User as UserIcon } from "lucide-react";
import { getUserAvatarUrl } from "@/lib/api";

export type ProfileUser = {
  name: string;
  email?: string;
  role?: string;
  roles?: string[];
  avatar?: string;
  preferences?: any;
  department?: string;
  researchCenter?: { name?: string } | string | null;
};

type ProfileImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileUser | null;
};

export function ProfileImageModal({ isOpen, onClose, user }: ProfileImageModalProps) {
  if (!isOpen || !user) return null;

  const centerName = typeof user.researchCenter === "object" ? user.researchCenter?.name : user.researchCenter;
  const displayRole = user.role || user.roles?.[0];
  const avatarUrl = getUserAvatarUrl(user);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-scale-up border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          {/* Profile Picture Frame */}
          <div className="relative mb-4 h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl ring-4 ring-[#9B0302]/15 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-extrabold text-slate-400">
                {user.name ? user.name.substring(0, 2).toUpperCase() : <UserIcon className="h-14 w-14" />}
              </div>
            )}
          </div>

          <h3 className="font-display text-lg font-bold text-slate-900">{user.name}</h3>
          {user.email && <p className="text-xs text-slate-500 font-medium mt-0.5">{user.email}</p>}

          <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] font-semibold">
            {displayRole && (
              <span className="rounded-full bg-[color:var(--maroon-50)] text-[color:var(--maroon-800)] border border-[color:var(--maroon-200)] px-3 py-0.5 capitalize">
                {displayRole.replace("_", " ")}
              </span>
            )}
            {user.department && (
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-0.5">
                Dept: {user.department}
              </span>
            )}
            {centerName && (
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5">
                {centerName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
