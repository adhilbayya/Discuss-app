"use client";

import DiscussCard from "./DiscussCard";

export type discussionType = {
  _id: string;
  title: string;
  description: string;
  upVote: number;
  createdAt: string;
  createdBy: string;
  isLikedByCurrentUser: boolean;
};

export interface DiscussionProp {
  discussions: discussionType[];
}

export default function DiscussHome({ discussions }: DiscussionProp) {
  return (
    <div>
      <DiscussCard discussions={discussions} />
    </div>
  );
}
