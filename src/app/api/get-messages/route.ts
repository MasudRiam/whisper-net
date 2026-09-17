import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as User | undefined;

  if (!session || !session.user || !sessionUser?._id) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(sessionUser._id)) {
      return Response.json(
        { success: false, message: "Invalid user id" },
        { status: 400 }
      );
    }
    const userId = new mongoose.Types.ObjectId(sessionUser._id);

    //mongodb aggregation to get messages
    const result = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: {
              $cond: [
                { $ifNull: ["$messages._id", false] },
                "$messages",
                "$$REMOVE",
              ],
            },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      // User exists but aggregation found nothing (should be rare) -> empty inbox
      return Response.json(
        {
          success: true,
          messages: [],
        },
        {
          status: 200,
        }
      );
    }

    return Response.json(
      {
        success: true,
        messages: result[0].messages ?? [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
