import { z } from "zod";

export const acceptMessageValidation = z.object ({
    acceptmessage: z.boolean()
})