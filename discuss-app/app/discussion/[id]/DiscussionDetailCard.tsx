"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/dateUtils";
import { toggleLike } from "@/app/actions/discussion.actions";

type DiscussionDetailType = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  upVote: number;
  createdAt: string;
  createdBy: string;
  isLikedByCurrentUser: boolean;
};

export default function DiscussionDetailCard({
  discussion,
}: {
  discussion: DiscussionDetailType;
}) {
  const [isLiked, setIsLiked] = useState(discussion.isLikedByCurrentUser);
  const [upvoteCount, setUpvoteCount] = useState(discussion.upVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    const previousIsLiked = isLiked;
    const previousUpVoteCount = upvoteCount;

    setIsLiked(!isLiked);
    setUpvoteCount(isLiked ? upvoteCount - 1 : upvoteCount + 1);
    setIsLoading(true);

    try {
      const result = await toggleLike(discussion._id);

      if (result.success) {
        setUpvoteCount(result.upVote);
        setIsLiked(result.likedBy);
      } else {
        setIsLiked(previousIsLiked);
        setUpvoteCount(previousUpVoteCount);
        console.error("Failed to toggle like:", result.error);
      }
    } catch (err) {
      setIsLiked(previousIsLiked);
      setUpvoteCount(previousUpVoteCount);
      console.error("Error toggling like:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle className="text-2xl">{discussion.title}</CardTitle>
        <Badge>{discussion.createdBy}</Badge>
      </CardHeader>
      <CardContent>
        <CardDescription>{discussion.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isLiked ? "default" : "outline"}
            onClick={handleLike}
            disabled={isLoading}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {upvoteCount}
          </Button>
        </div>
        <CardDescription suppressHydrationWarning>
          {formatRelativeTime(discussion.createdAt)}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
