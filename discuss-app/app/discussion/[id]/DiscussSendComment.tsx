"use client";

import addComment from "@/app/actions/comment.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DiscussSendCommentProps {
  discussId: string;
  userId?: string;
}

export default function DiscussSendComment({
  discussId,
  userId,
}: DiscussSendCommentProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!userId) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await addComment(discussId, comment, userId);
      if (res?.success) {
        setComment("");
        router.refresh();
      } else {
        setError(res?.error || "Failed to add comment");
      }
    } catch (err) {
      setError("An error occurred while adding comment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col mt-3">
      <Label className="mb-2">Comment:</Label>
      <div className="flex justify-center items-center gap-2">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className=""
          placeholder="What do you think..."
          disabled={isLoading}
        />
        <Button variant="outline" onClick={handleSubmit} disabled={isLoading}>
          <Send />
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
