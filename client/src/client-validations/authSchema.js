import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),

  email: z
    .string()
    .email("Please enter valid email address.")
    .min(5, "Too short")
    .max(50, "Max 50 characters"),

  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(50, "Too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Must include A-Z, a-z, 0-9 & special char"
    ),

  name: z
    .string()
    .min(2, "At least 2 characters")
    .max(50, "Max 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only letters & spaces are allowed"),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(20, "Max 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),

  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(50, "Too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Must include A-Z, a-z, 0-9 & special char"
    ),
});
