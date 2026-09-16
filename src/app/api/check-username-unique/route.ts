import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

import { z } from "zod";


const usernameQuerySchema = z.object ({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = { username: searchParams.get("username") };

        const result = usernameQuerySchema.safeParse(queryParams);


        if (!result.success) {
            const usernameError = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: "Invalid request",
                errors: usernameError
            }, {
                status: 400
            });
        }

        const { username } = result.data;

        const user = await UserModel.findOne({ username, isActive: true });

        if (user) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 409
            });
        }

        return Response.json({
            success: true,
            message: "Valid username"
        });
    } catch (error) {


        return Response.json({
            success: false,
            message: "Invalid request"
        }, {
            status: 500
        })
        
    }



}