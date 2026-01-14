"use client";

import { toggleCommentLike } from "@/app/actions/comment.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/dateUtils";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";

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

export default function CommentCard({
  comment,
}: {
  comment: discussCommentType;
}) {
  const [isLiked, setIsLiked] = useState(comment.isLikedByCurrentUser);
  const [upVote, setUpVote] = useState(comment.upVote);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    const previousIsLiked = isLiked;
    const previousUpVote = upVote;

    setIsLiked(!isLiked);
    setUpVote(isLiked ? upVote - 1 : upVote + 1);
    setLoading(true);

    try {
      const result = await toggleCommentLike(comment._id);
      if (result.success) {
        setIsLiked(result.likedBy);
        setUpVote(result.upVote);
      } else {
        setIsLiked(previousIsLiked);
        setUpVote(previousUpVote);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card key={comment._id} className="m-2">
      <CardHeader>
        <Badge className="text-sm">{comment.createdBy}</Badge>
        <CardDescription>{comment.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isLiked ? "default" : "outline"}
            onClick={handleLike}
            disabled={loading}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {upVote}
          </Button>
        </div>
        <CardDescription suppressHydrationWarning>
          {formatRelativeTime(comment.createdAt)}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
