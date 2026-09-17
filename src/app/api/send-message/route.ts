import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { messageValidation } from "@/schemas/messageSchema";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { username, content } = body ?? {};

    if (typeof username !== "string" || !username.trim()) {
      return Response.json(
        {
          success: false,
          message: "Username is required",
        },
        {
          status: 400,
        }
      );
    }

    const contentCheck = messageValidation.safeParse({ content });
    if (!contentCheck.success) {
      return Response.json(
        {
          success: false,
          message:
            contentCheck.error.format().content?._errors?.[0] ??
            "Invalid message content",
        },
        {
          status: 400,
        }
      );
    }

    const user = await UserModel.findOne({ username: username.trim() });

    if (!user) {
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

    if (!user.isActive) {
      return Response.json(
        {
          success: false,
          message: "User account is not verified",
        },
        {
          status: 403,
        }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = {
      content: contentCheck.data.content,
      createdAt: new Date(),
    };
    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json(
      {
        success: false,
        message: "Error sending message",
      },
      {
        status: 500,
      }
    );
  }
}
