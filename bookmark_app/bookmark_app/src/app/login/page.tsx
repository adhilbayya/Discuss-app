"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-stone-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
              Bookmark App 📖
            </h1>
            <p className="text-stone-600">
              Save and organize your favorite links
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-stone-50 text-stone-800 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg border border-stone-300 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
