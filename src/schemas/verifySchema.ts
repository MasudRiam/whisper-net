import { z } from "zod";

export const verifyValidation = z.object ({
    code: z.string().length(6, {message: "Your code is not valid"}).regex(/^[0-9]{6}$/, {message: "Code must be 6 digits"})
})