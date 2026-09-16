import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request: Request) {
    await dbConnect();



    try {
        const {username, code} = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne ({ username: decodedUsername})
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {
                status: 404
            });
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date (user.verifyCodeExpire) > new Date();
        if (isCodeValid && isCodeNotExpired) {
            user.isActive = true;
            user.verifyCode = "";
            await user.save();

            return Response.json({
                success: true,
                message: "Account verified successfully"
            }, {
                status: 200
            });
        } else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verify code has expired, please request a new one"
            }, {
                status: 400
            });
        } else {
            return Response.json({
                success: false,
                message: "Invalid verify code"
            }, {
                status: 400
            });
        }
        
    } catch (error) {
        console.log("Error occurred while verifying code:", error)
        return Response.json({
            success: false,
            message: "Invalid verify code request"
        }, {
            status: 500
        });
        
    }
}




