import mongoose, { Schema } from "mongoose";

export interface DiscussUserDoc {
  email: string;
  password: string;
  fullName: string;
}

const discussUserSchema = new Schema<DiscussUserDoc>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DiscussUser ||
  mongoose.model("DiscussUser", discussUserSchema);
