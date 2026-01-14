import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export default async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("Mongo key is not working");
  }

  await mongoose.connect(MONGODB_URI);
  return mongoose;
}
