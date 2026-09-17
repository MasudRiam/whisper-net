import { z } from "zod";

export const messageValidation = z.object ({
    content: z.string().trim().min(1, {message: "Message cannot be empty"}).max(300, {message: "Too many text. need to cut"})
})