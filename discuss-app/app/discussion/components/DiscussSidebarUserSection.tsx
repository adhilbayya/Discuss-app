import { auth } from "@/app/lib/auth";
import DiscussSidebarUserClient from "./DiscussSidebarUserClient";

export default async function DiscussSidebarUserSection() {
  const session = await auth();

  return (
    <DiscussSidebarUserClient
      userName={session?.user?.name || "User"}
      userEmail={session?.user?.email || ""}
      userImage={session?.user?.image || null}
    />
  );
}
