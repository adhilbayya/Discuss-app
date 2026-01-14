import { Card, CardTitle } from "@/components/ui/card";
import { getDiscussionById } from "@/app/actions/discussion.actions";
import DiscussCommentCard from "./DiscussCommentCard";
import DiscussSendComment from "./DiscussSendComment";
import { getCommentByDiscussionId } from "@/app/actions/comment.actions";
import { auth } from "@/app/lib/auth";
import DiscussionDetailCard from "./DiscussionDetailCard";

export default async function DiscussionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const session = await auth();

  const discussion = await getDiscussionById(id);

  if (!discussion)
    return (
      <Card key={0}>
        <CardTitle>Discussion not found</CardTitle>
      </Card>
    );

  const comments = await getCommentByDiscussionId(discussion._id);
  return (
    <div>
      <DiscussionDetailCard discussion={discussion} />
      <DiscussSendComment
        discussId={discussion._id}
        userId={session?.user?.id}
      />
      <DiscussCommentCard comments={comments} />
    </div>
  );
}
