import { z } from "zod";

export const verifyValidation = z.object ({
    code: z.string().length(6, {message: "Your code is not valid"})
})