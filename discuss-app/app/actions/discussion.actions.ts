"use server";

import { auth } from "../lib/auth";
import connectDB from "../lib/mongodb";
import { createDiscussionSchema } from "../lib/validations";
import DiscussDiscussion from "../model/DiscussDiscussion";
import DiscussUser from "../model/DiscussUser";

export async function getDiscussions() {
  try {
    await connectDB();

    const session = await auth();
    const currentUserId = session?.user?.id;

    const discussions = await DiscussDiscussion.find({})
      .populate("userId", "fullName")
      .sort({
        createdAt: -1,
      });

    const discussionWithUser = discussions.map((discussion) => {
      return {
        _id: discussion._id.toString(),
        userId: discussion.userId?.toString(),
        title: discussion.title,
        description: discussion.description,
        upVote: discussion.upVote,
        createdAt: discussion.createdAt.toISOString(),
        createdBy: discussion.userId?.fullName,
        isLikedByCurrentUser: currentUserId
          ? discussion.likedBy.includes(currentUserId)
          : false,
      };
    });
    return discussionWithUser;
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log("An unexpected error occurred", err);
    }
    return [];
  }
}

export async function getDiscussionById(id: string) {
  await connectDB();
  const session = await auth();
  const currentUserId = session?.user?.id;

  const discussion = await DiscussDiscussion.findById(id);
  if (!discussion) {
    return null;
  }

  const user = await DiscussUser.findById(discussion.userId);

  return {
    _id: discussion._id.toString(),
    userId: discussion.userId.toString(),
    title: discussion.title,
    description: discussion.description,
    upVote: discussion.upVote,
    createdAt: discussion.createdAt.toISOString(),
    createdBy: user?.fullName,
    isLikedByCurrentUser: currentUserId
      ? discussion.likedBy.includes(currentUserId)
      : false,
  };
}

export async function addDiscussion(
  title: string,
  description: string,
  userId: string
) {
  const validation = createDiscussionSchema.safeParse({
    title,
    description,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  if (!title?.trim() || !description?.trim()) {
    return { success: false, error: "Both the feilds are required" };
  }
  try {
    await connectDB();
    const discussion = await DiscussDiscussion.create({
      title: validation.data.title,
      description: validation.data.description,
      userId,
      upVote: 0,
    });
    return {
      success: true,
      data: {
        _id: discussion._id.toString(),
        userId: discussion.userId.toString(),
        title: discussion.title,
        description: discussion.description,
        upVote: discussion.upVote,
        createdAt: discussion.createdAt.toISOString(),
      },
    };
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    } else {
      console.log("An unexpected error occurred", err);
    }
  }
}

export async function getMyDiscussions(userId: string) {
  try {
    await connectDB();

    const discussions = await DiscussDiscussion.find({ userId })
      .populate("userId", "fullName")
      .sort({
        createdAt: -1,
      });

    const discussionsWithUser = discussions.map((discussion) => {
      return {
        _id: discussion._id.toString(),
        userId: discussion.userId.toString(),
        title: discussion.title,
        description: discussion.description,
        upVote: discussion.upVote,
        createdAt: discussion.createdAt.toISOString(),
        createdBy: discussion.userId?.fullName || "Unknown User",
        isLikedByCurrentUser: discussion.likedBy.includes(userId),
      };
    });

    return discussionsWithUser;
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log("An unexpected error occurred", err);
    }
    return [];
  }
}

export async function toggleLike(discussId: string) {
  try {
    const session = await auth();
    await connectDB();

    const discussion = await DiscussDiscussion.findById(discussId);

    const userId = session?.user?.id;
    const hasLiked = discussion.likedBy.includes(userId);

    let updatedDiscussion;
    if (hasLiked) {
      updatedDiscussion = await DiscussDiscussion.findByIdAndUpdate(
        discussId,
        {
          $pull: { likedBy: userId },
          $inc: { upVote: -1 },
        },
        { new: true }
      );
    } else {
      updatedDiscussion = await DiscussDiscussion.findByIdAndUpdate(
        discussId,
        {
          $push: { likedBy: userId },
          $inc: { upVote: 1 },
        },
        { new: true }
      );
    }

    return {
      success: true,
      upVote: updatedDiscussion?.upVote || 0,
      likedBy: !hasLiked,
    };
  } catch (err) {
    console.error("Error in toggleLike:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      upVote: 0,
      likedBy: false,
    };
  }
}
