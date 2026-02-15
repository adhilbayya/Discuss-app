"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function BookmarkForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        title,
        url,
        user_id: userId,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Error adding bookmark:", error);
      alert("Failed to add bookmark. Please try again.");
      return;
    }

    // Clear form - Realtime will handle adding to the list
    setTitle("");
    setUrl("");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
        <span className="text-xl">➕</span>
        Add New Bookmark
      </h2>
      <form onSubmit={submit} className="flex flex-col md:flex-row gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bookmark title"
          className="flex-1 border border-stone-300 focus:border-gray-300 focus:ring-2 focus:ring-amber-100 p-3 rounded-lg outline-none transition-colors"
          required
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          type="url"
          className="flex-1 border border-stone-300 focus:border-gray-300 focus:ring-2 focus:ring-amber-100 p-3 rounded-lg outline-none transition-colors"
          required
        />
        <button
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {loading ? "Adding..." : "Add Bookmark"}
        </button>
      </form>
    </div>
  );
}
