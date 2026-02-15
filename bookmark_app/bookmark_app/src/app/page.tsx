"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";
import BookmarkForm from "./components/BookmarkForm";
import BookmarkList from "./components/BookmarkList";
import UserProfile from "./components/UserProfile";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<string>("connecting");
  const router = useRouter();

  const fetchBookmarks = useCallback(async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });
    setBookmarks(data || []);
  }, []);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      setBookmarks(data || []);
      setLoading(false);

      // Realtime subscription for cross-tab synchronization
      channel = supabase
        .channel("public:bookmarks")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setBookmarks((prev) => {
                if (prev.find((b) => b.id === payload.new.id)) {
                  return prev;
                }
                return [payload.new, ...prev];
              });
            } else if (payload.eventType === "UPDATE") {
              setBookmarks((prev) =>
                prev.map((b) => (b.id === payload.new.id ? payload.new : b)),
              );
            } else if (payload.eventType === "DELETE") {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe((status, err) => {
          if (err) {
            console.error("Realtime subscription error:", err);
          }
          setRealtimeStatus(status);
        });
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">
                  My Bookmarks
                </h1>
              </div>
            </div>

            <UserProfile user={user} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 md:p-8 space-y-6">
          <BookmarkForm userId={user.id} />
          <BookmarkList bookmarks={bookmarks} />
        </div>
      </main>
    </div>
  );
}
