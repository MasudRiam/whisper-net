import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifyValidation } from "@/schemas/verifySchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { username, code } = body ?? {};

    if (typeof username !== "string" || !username) {
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

    const codeCheck = verifyValidation.safeParse({ code });
    if (!codeCheck.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid verification code format",
        },
        {
          status: 400,
        }
      );
    }

    let decodedUsername: string;
    try {
      decodedUsername = decodeURIComponent(username);
    } catch {
      return Response.json(
        { success: false, message: "Invalid username" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username: decodedUsername });
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

    if (user.isActive) {
      return Response.json(
        {
          success: true,
          message: "Account already verified. Please sign in.",
        },
        {
          status: 200,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = user.verifyCodeExpire
      ? new Date(user.verifyCodeExpire) > new Date()
      : false;
    if (isCodeValid && isCodeNotExpired) {
      user.isActive = true;
      user.verifyCode = "";
      // Clear expiry (field is optional in schema)
      user.verifyCodeExpire = undefined as unknown as Date;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verify code has expired, please sign up again to get a new code",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid verify code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error occurred while verifying code:", error);
    return Response.json(
      {
        success: false,
        message: "Invalid verify code request",
      },
      {
        status: 500,
      }
    );
  }
}
