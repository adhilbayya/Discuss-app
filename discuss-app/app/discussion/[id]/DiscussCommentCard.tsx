import { Card, CardContent, CardDescription } from "@/components/ui/card";
import CommentCard from "./CommentCard";

type discussCommentType = {
  _id: string;
  userId: string;
  discussId: string;
  description: string;
  upVote: number;
  createdAt: string;
  createdBy: string;
  isLikedByCurrentUser: boolean;
};

interface DiscussCommentCardProps {
  comments: discussCommentType[];
}

export default function DiscussCommentCard({
  comments,
}: DiscussCommentCardProps) {
  if (comments.length === 0) {
    return (
      <div>
        <Card className="mt-3">
          <CardContent className="text-center">
            <CardDescription className="text-sm py-8">
              No comments yet
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return comments.map((comment) => (
    <CommentCard key={comment._id} comment={comment} />
  ));
}
