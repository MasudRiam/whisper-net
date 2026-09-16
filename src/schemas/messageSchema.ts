import { z } from "zod";

export const messageValidation = z.object ({
    content: z.string().max(300, {message: "Too many text. need to cut"})
})