import { resend } from "@/lib/resend";
import VerificationEmailTemplate from "@/email-template/verificationEmailTemplate";
import { ApiResponse } from "@/type/apiResponse";




export async function sendEmailVerification(username: string, email: string, Code: string): Promise<ApiResponse> {
  try {
    if (!email || !username || !Code) {
      return { success: false, message: "Missing email parameters" };
    }

    const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const result = await resend.emails.send({
      from,
      to: email,
      subject: "Verify your WhisperNet account",
      react: VerificationEmailTemplate({ username, otp: Code }),
    });

    if (result.error) {
      console.error("Resend API error:", result.error);
      return {
        success: false,
        message: "Failed to send verification email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Email verification sent successfully."
    };
  } catch (error) {
    console.error("Error sending email verification:", error);
    return {
      success: false,
      message: "Failed to send email verification. Please try again later."
    };
  }
}
