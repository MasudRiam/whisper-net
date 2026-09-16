import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


import { sendEmailVerification } from "@/helper/sendEmailVerification";



export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json();

        const existingUserByUsername = await UserModel.findOne ({username, isActive: true})

        if (existingUserByUsername) {
            return Response.json ({ success: false, message: "Username already exists" }, { status: 400 });
        }

        const existingUserByEmail = await UserModel.findOne ({email});

        const expireDate = new Date(Date.now() + 10 * 60 * 1000); 
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); 

        // Check if the user already exists by email
        if (existingUserByEmail) {
            if (existingUserByEmail.isActive) {
                    return Response.json ({ success: false, message: "Email already exists" }, { status: 400 });
            }else {
                // If the user exists but is not active, update the verification code and expiration date
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpire = expireDate;

                await existingUserByEmail.save()
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
           

            const newUserModel = new UserModel ({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: expireDate,
                isActive: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUserModel.save();
        }
        const emailResponse = await sendEmailVerification(username, email, verifyCode);

        if (!emailResponse.success) {
            return  Response.json ({ success: false, message: emailResponse.message }, { status: 500 });
        }

            return Response.json(
                { success: true, message: "Signup successful, verification email sent." },
                { status: 200 }
            );

    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(JSON.stringify({ accept: false, message: "Internal server error" }), { status: 500 });
        
    }
}


