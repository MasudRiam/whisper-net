import { z } from "zod";

export const signInValidation = z.object ({
    identifier: z.string().min(1, { message: "Email or username is required" }).trim(),
    password: z.string().min(1, { message: "Password is required" })
})

// Keep old export name for backwards-compatibility
export const signInvalidation = signInValidation;