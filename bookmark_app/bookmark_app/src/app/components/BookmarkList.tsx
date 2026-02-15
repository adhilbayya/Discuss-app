"use client";

import { Delete, LucideDelete, Trash } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useState } from "react";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  created_at?: string;
};

export default function BookmarkList({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const remove = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting bookmark:", error);
      setDeletingId(null);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500 text-lg mt-4">No bookmarks yet</p>
        <p className="text-stone-400 text-sm mt-1">
          Add your first bookmark above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
        <span className="text-xl">📑</span>
        Your Bookmarks ({bookmarks.length})
      </h2>
      <div className="space-y-2">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className={`group flex items-center justify-between border border-stone-200 p-4 rounded-lg hover:border-amber-700 hover:shadow-sm transition-all bg-white ${
              deletingId === b.id ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <a
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 mr-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg">🔗</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-800 font-medium truncate group-hover:text-amber-700 transition-colors">
                    {b.title}
                  </p>
                  <p className="text-stone-500 text-sm truncate">{b.url}</p>
                </div>
              </div>
            </a>
            <button
              onClick={() => remove(b.id)}
              disabled={deletingId === b.id}
              className="shrink-0 text-stone-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors group-hover:opacity-100 md:opacity-0"
              title="Delete bookmark"
            >
              {deletingId === b.id ? "..." : <Trash />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
