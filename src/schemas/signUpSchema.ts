import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(3, "Minimum 3 characters")
    .max(16, "Maximum 16 characters")
    .regex(/^[a-zA-Z0-9_]{3,16}$/, "Username must not be special characters")


export const signUpValidation = z.object({
  username: usernameValidation,
  email: z.string().email({message: "invalid email"}),
  password: z.string().min(6, {message: "Your password too short"}).max(16, {message: "Too long password"})
});