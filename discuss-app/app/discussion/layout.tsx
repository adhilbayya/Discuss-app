import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DiscussSidebar from "./components/DiscussSidebar";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <DiscussSidebar />
      <main className="w-full m-5">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
