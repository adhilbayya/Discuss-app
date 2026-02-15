"use client";

import { supabase } from "../lib/supabase";

export default function LoginButton() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return <button onClick={login}>Login with google</button>;
}
