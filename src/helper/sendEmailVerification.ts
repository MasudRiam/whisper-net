import { resend } from "@/lib/resend";
import VerificationEmailTemplate from "@/email-template/verificationEmailTemplate";
import { ApiResponse } from "@/type/apiResponse";




export async function sendEmailVerification(username: string, email: string, Code: string): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'User Verification OTP',
      react: VerificationEmailTemplate({username, otp: Code}),
    });



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
