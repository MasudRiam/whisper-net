import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendEmailVerification } from "@/helper/sendEmailVerification";
import { signUpValidation } from "@/schemas/signUpSchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const parsed = signUpValidation.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.format();
      const message =
        errors.username?._errors?.[0] ||
        errors.email?._errors?.[0] ||
        errors.password?._errors?.[0] ||
        "Invalid sign-up data";
      return Response.json({ success: false, message }, { status: 400 });
    }

    const { username, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedUsername = username.trim();

    const existingActiveUserByUsername = await UserModel.findOne({
      username: trimmedUsername,
      isActive: true,
    });

    if (existingActiveUserByUsername) {
      return Response.json(
        { success: false, message: "Username already exists" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({
      email: normalizedEmail,
    });

    const expireDate = new Date(Date.now() + 10 * 60 * 1000);
    const verifyCode = randomInt(100000, 1000000).toString();

    // Check if the user already exists by email
    if (existingUserByEmail) {
      if (existingUserByEmail.isActive) {
        return Response.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
      } else {
        // If the user exists but is not active, update credentials.
        // Also allow username change if the new username is not taken.
        if (existingUserByEmail.username !== trimmedUsername) {
          const usernameTaken = await UserModel.findOne({
            username: trimmedUsername,
          });
          if (usernameTaken) {
            return Response.json(
              { success: false, message: "Username already exists" },
              { status: 400 }
            );
          }
          existingUserByEmail.username = trimmedUsername;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpire = expireDate;

        await existingUserByEmail.save();
      }
    } else {
      // Prevent duplicate inactive username for a different email
      const existingInactiveUsername = await UserModel.findOne({
        username: trimmedUsername,
      });
      if (existingInactiveUsername) {
        return Response.json(
          {
            success: false,
            message: "Username already exists, please verify or choose another",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUserModel = new UserModel({
        username: trimmedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpire: expireDate,
        isActive: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUserModel.save();
    }
    const emailResponse = await sendEmailVerification(
      trimmedUsername,
      normalizedEmail,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, message: "Signup successful, verification email sent." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in sign-up route:", error);
    // Handle duplicate-key race condition gracefully
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return Response.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
