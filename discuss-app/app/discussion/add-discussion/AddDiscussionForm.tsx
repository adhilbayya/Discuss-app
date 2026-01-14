"use client";

import { addDiscussion } from "@/app/actions/discussion.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddDiscussionFormProps {
  userId: string;
}

export default function AddDiscussionForm({ userId }: AddDiscussionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Both the fields are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await addDiscussion(title, description, userId);
      if (res?.success) {
        router.push("/discussion");
      } else {
        setError(res?.error || "Error while adding");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/discussion");
  };

  return (
    <div>
      <Card className="mt-3">
        <CardHeader>
          <CardTitle>Create new Discussion</CardTitle>
          <CardDescription>
            What&apos;s on your mind that you wanna discuss
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="mb-3">
            <Label className="mb-2">Topic</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion topic"
              disabled={isLoading}
            />
          </div>
          <div className="mb-3">
            <Label className="mb-2">Idea</Label>
            <Textarea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              placeholder="What's on your mind"
              disabled={isLoading}
              rows={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button onClick={handleCancel} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
