import { z } from "zod";

export const acceptMessageValidation = z.object ({
    acceptMessage: z.boolean({ message: "acceptMessage must be a boolean" }),
    // aliases for backwards-compatibility with existing forms/routes
    acceptmessage: z.boolean().optional(),
    isAcceptingMessage: z.boolean().optional(),
})