import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { User } from "next-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageid: string }> }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User | undefined;

  if (!session || !session.user || !user?._id) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { messageid } = await params;

  if (!messageid || !mongoose.Types.ObjectId.isValid(messageid)) {
    return Response.json(
      { success: false, message: "Invalid message id" },
      { status: 400 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageid } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { success: false, message: "Message not found or already deleted" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
