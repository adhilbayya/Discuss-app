"use server";
import { ZodError } from "zod";
import connectDB from "../lib/mongodb";
import { userResgistrationSchema } from "../lib/validations";
import DiscussUser from "../model/DiscussUser";
import bcrypt from "bcryptjs";

export async function createDiscussAccount(
  email: string,
  password: string,
  fullName: string
) {
  const validation = userResgistrationSchema.safeParse({
    email,
    password,
    fullName,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  try {
    await connectDB();

    const existingUser = await DiscussUser.findOne({
      email: validation.data.email,
    });
    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const encrytedPassword = await bcrypt.hash(validation.data.password, 12);

    await DiscussUser.create({
      email: validation.data.email,
      password: encrytedPassword,
      fullName: validation.data.fullName,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0]?.message };
    } else {
      console.log("An unexpected error occurred", error);
    }
  }
}
