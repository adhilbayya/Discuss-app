import { z } from "zod";

export const createDiscussionSchema = z.object({
  title: z
    .string()
    .min(3, "Must not be less than 3 characters")
    .max(200, "Must not be more than 200 characters")
    .trim(),
  description: z
    .string()
    .min(3, "Must not be less than 3 characters")
    .max(1000, "Must not be more than 1000 characters")
    .trim(),
});

export const createCommentSchema = z.object({
  description: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must not exceed 2000 characters")
    .trim(),
});

export const userResgistrationSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name should be more than 3 characters")
    .max(30, "Full name should not be more than 30 characters")
    .trim(),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password should be 8 or more characters long")
    .regex(/[A-Z]/, "Password must contain atleast one uppercase letter")
    .regex(/[a-z]/, "Password must contain atleast one lowercase letter")
    .regex(/[0-9]/, "Password must contain atleast one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UserregistrationInput = z.infer<typeof userResgistrationSchema>;
