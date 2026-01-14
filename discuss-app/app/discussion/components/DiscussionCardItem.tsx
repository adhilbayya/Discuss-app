"use client";

import { useState } from "react";
import { discussionType } from "./DiscussHome";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircleMore, ThumbsUp } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/dateUtils";
import { toggleLike } from "@/app/actions/discussion.actions";

interface DiscussionCardItemProp {
  discussion: discussionType;
}

export default function DiscussionCardItem({
  discussion,
}: DiscussionCardItemProp) {
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
    <Card className="m-1" key={discussion._id}>
      <CardHeader className="flex justify-between">
        <CardTitle className="text-xl">{discussion.title}</CardTitle>
        <div className="flex gap-2">
          <Link href={`/discussion/${discussion._id}`}>
            <Badge variant="outline">
              View <Eye />
            </Badge>
          </Link>
          <Badge>{discussion.createdBy}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{discussion.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <ButtonGroup>
            <Button size="icon-sm">{upvoteCount}</Button>
            <Button
              size="icon-sm"
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              disabled={isLoading}
            >
              <ThumbsUp />
            </Button>
            <Link href={`/discussion/${discussion._id}`}>
              <Button variant="outline" size="sm">
                Comment
                <MessageCircleMore />
              </Button>
            </Link>
          </ButtonGroup>
        </div>

        <CardDescription suppressHydrationWarning>
          {formatRelativeTime(discussion.createdAt)}
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
