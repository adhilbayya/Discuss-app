"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export default function UserProfile({ user }: { user: User }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = () => setIsOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full border-2 border-stone-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold border-2 border-stone-200">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-stone-800">{displayName}</p>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-stone-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-stone-200">
            <p className="text-sm font-semibold text-stone-800 truncate">
              {displayName}
            </p>
            <p className="text-xs text-stone-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
