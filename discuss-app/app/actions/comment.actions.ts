"use server";

import { ZodError } from "zod";
import { auth } from "../lib/auth";
import connectDB from "../lib/mongodb";
import { createCommentSchema } from "../lib/validations";
import DiscussComment from "../model/DiscussComment";

export default async function addComment(
  discussId: string,
  description: string,
  userId: string
) {
  const validation = createCommentSchema.safeParse({
    description,
  });
  try {
    await connectDB();

    const comment = await DiscussComment.create({
      discussId,
      description: validation.data?.description,
      userId,
      upVote: 0,
      likedBy: [],
    });

    return {
      success: true,
      data: {
        _id: comment._id.toString(),
        discussId: comment.discussId.toString(),
        userId: comment.userId.toString(),
        description: comment.description,
        upVote: comment.upVote,
        createdAt: comment.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    } else {
      console.log("An unexpected error occurred", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }
}

export async function getCommentByDiscussionId(discussId: string) {
  try {
    await connectDB();
    const session = await auth();
    const currentUserId = session?.user?.id;

    const comments = await DiscussComment.find({ discussId })
      .populate("userId", "fullName")
      .sort({
        createdAt: 1,
      })
      .lean();

    const commentsWithUser = comments.map((comment) => {
      return {
        _id: comment._id.toString(),
        userId: comment.userId.toString(),
        discussId: comment.discussId,
        description: comment.description,
        upVote: comment.upVote,
        createdAt: comment.createdAt.toISOString(),
        createdBy: comment.userId?.fullName || "Unknown User",
        isLikedByCurrentUser: currentUserId
          ? comment.likedBy.includes(currentUserId)
          : false,
      };
    });
    return commentsWithUser;
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error fetching comments:", err.message);
    } else {
      console.error("An unexpected error occurred", err);
    }
    return [];
  }
}

export async function toggleCommentLike(commentId: string) {
  try {
    const session = await auth();

    await connectDB();

    const comment = await DiscussComment.findById(commentId);

    const userId = session?.user?.id;
    const hasLiked = comment.likedBy.includes(userId);

    let updatedComment;
    if (hasLiked) {
      updatedComment = await DiscussComment.findByIdAndUpdate(
        commentId,
        {
          $pull: { likedBy: userId },
          $inc: { upVote: -1 },
        },
        { new: true }
      );
    } else {
      updatedComment = await DiscussComment.findByIdAndUpdate(
        commentId,
        {
          $push: { likedBy: userId },
          $inc: { upVote: 1 },
        },
        { new: true }
      );
    }

    return {
      success: true,
      upVote: updatedComment?.upVote || 0,
      likedBy: !hasLiked,
    };
  } catch (err) {
    console.error("Error: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      upVote: 0,
      likedBy: false,
    };
  }
}
