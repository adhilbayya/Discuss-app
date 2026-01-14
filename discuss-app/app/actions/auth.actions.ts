"use server";
import connectDB from "../lib/mongodb";
import DiscussUser from "../model/DiscussUser";
import bcrypt from "bcryptjs";

export async function createDiscussAccount(
  email: string,
  password: string,
  fullName: string
) {
  try {
    await connectDB();

    const existingUser = await DiscussUser.findOne({ email });
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const encrytedPassword = await bcrypt.hash(password, 12);

    await DiscussUser.create({
      email,
      password: encrytedPassword,
      fullName,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message };
    } else {
      console.log("An unexpected error occurred", err);
    }
  }
}
