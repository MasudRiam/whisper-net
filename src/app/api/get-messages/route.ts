import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function GET(request: Request) {

    await dbConnect();
    
    const session = await getServerSession(authOptions);
    const user = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, {
            status: 401
        });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        //moongodb aggregation to get messages
        const user = await UserModel.aggregate ([
            {$match: { _id: userId }},
            {$unwind: "$messages" },
            {$sort: { "messages.createdAt": -1 }},
            {$group: {_id: "$_id", messages: { $push: "$messages" } }},
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "No messages found"
            }, {
                status: 404
            });
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        }, {
            status: 200
        });


    } catch (error) {
        console.error("Error fetching messages:", error);
        return Response.json({
            success: false,
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}   