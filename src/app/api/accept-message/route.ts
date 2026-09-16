import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

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

  const user = session.user as User;
  const userId = user._id;

  const { isAcceptingMessage } = await request.json();

  console.log(`User ID: ${userId}, Accepting Messages: ${isAcceptingMessage}`);

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage },
      { new: true }
    );

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
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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
    const foundUser = await UserModel.findById(userId);

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
