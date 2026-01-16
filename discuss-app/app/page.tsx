import { redirect } from "next/navigation";
import { auth } from "./lib/auth";
import { ThemeProvider } from "./provider";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/discussion");
  } else {
    redirect("/login");
  }
}
