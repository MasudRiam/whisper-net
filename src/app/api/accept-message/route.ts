import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { session: null, userId: null };
  const user = session.user as User;
  return { session, userId: user._id };
}

export async function POST(request: Request) {
  await dbConnect();

  const { userId } = await getUserIdFromSession();

  if (!userId) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized User",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();
    const { isAcceptingMessage } = body ?? {};

    if (typeof isAcceptingMessage !== "boolean") {
      return Response.json(
        {
          success: false,
          message: "isAcceptingMessage must be a boolean",
        },
        {
          status: 400,
        }
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage },
      { new: true, runValidators: true }
    ).select("-password -verifyCode -verifyCodeExpire");

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: `User is now ${isAcceptingMessage ? "accepting" : "not accepting"} messages`,
        isAcceptingMessage: updatedUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating accept-message status:", error);
    return Response.json(
      {
        success: false,
        message: "Error accepting message",
      },
      {
        status: 500,
      }
    );
  }
}

// PATCH alias for semantic correctness (POST kept for backwards-compat)
export async function PATCH(request: Request) {
  return POST(request);
}

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized User",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId).select(
      "isAcceptingMessage"
    );

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      isAcceptingMessage: foundUser.isAcceptingMessage,
      message: "User found",
    });
  } catch (error) {
    console.error("Error fetching accept-message status:", error);
    return Response.json(
      {
        success: false,
        message: "Error fetching user",
      },
      {
        status: 500,
      }
    );
  }
}
