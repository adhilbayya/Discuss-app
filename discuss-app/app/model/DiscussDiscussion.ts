import mongoose, { Schema } from "mongoose";

export interface DiscussionDoc {
  userId: string;
  title: string;
  description: string;
  upVote: number;
  likedBy: string[];
  createdAt: Date;
}

const DiscussionSchema = new Schema<DiscussionDoc>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
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

export default mongoose.models.Discussion ||
  mongoose.model("Discussion", DiscussionSchema);
