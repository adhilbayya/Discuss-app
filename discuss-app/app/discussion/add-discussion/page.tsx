import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import AddDiscussionForm from "./AddDiscussionForm";
import { Label } from "@/components/ui/label";

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div>
      <Label className="mb-3 text-3xl">New Discussion</Label>
      <AddDiscussionForm userId={session.user.id} />
    </div>
  );
}
