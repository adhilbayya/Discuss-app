import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { getMyDiscussions } from "@/app/actions/discussion.actions";
import DiscussCard from "../components/DiscussCard";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default async function DiscussMyDiscussion() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const myDiscussions = await getMyDiscussions(session.user.id);

  return (
    <div>
      <Label className="mb-3 text-3xl">My discussions</Label>
      {myDiscussions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              You haven&apos;t created any discussions yet.
            </p>
            <Link href="/discussion/add-discussion">
              <Button>Create Your First Discussion</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4 mt-3">
            You have {myDiscussions.length} discussion
          </p>
          <DiscussCard discussions={myDiscussions} />
        </div>
      )}
    </div>
  );
}
