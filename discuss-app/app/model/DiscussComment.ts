import mongoose, { Schema } from "mongoose";

export interface DiscussCommentDoc {
  discussId: string;
  userId: mongoose.Schema.Types.ObjectId;
  description: string;
  upVote: number;
  likedBy: string[];
  createdAt: Date;
}

const CommentSchema = new Schema<DiscussCommentDoc>(
  {
    discussId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussUser",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    upVote: {
      type: Number,
      required: false,
      default: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DiscussComment ||
  mongoose.model("DiscussComment", CommentSchema);
