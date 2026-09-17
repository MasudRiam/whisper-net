import  CredentialsProvider  from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { signInValidation } from "@/schemas/signInSchema";



export const authOptions: NextAuthOptions = {
providers: [
  CredentialsProvider({
        id: "credentials",
        name: "Credentials",
         credentials: {
        identifier: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" }
    },
    async authorize (credentials: Record<"identifier" | "password", string> | undefined): Promise<any> {
        await dbConnect();

        try {
            const parsed = signInValidation.safeParse(credentials);
            if (!parsed.success) {
                throw new Error("Email/username and password are required");
            }
            const { identifier, password } = parsed.data;

            const user = await UserModel.findOne({
                $or: [{ email: identifier.toLowerCase().trim() },
                { username: identifier.trim() }]
            });

            if (!user) {
                throw new Error("No user found with the given credentials");
            }

            if (!user.isActive) {
                throw new Error("Please verify your account before logging in");
            }

            const isPasswordCorrect = await bcrypt.compare (password, user.password);

            if (isPasswordCorrect) {
                return user;
            } else {
                throw new Error("Invalid password");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                throw new Error(err.message);
            }
            throw new Error("Authentication failed");
        }

    }
  })
],
callbacks: {
    async jwt({ token, user }) {
            if (user) {
                token.id = user._id?.toString();
                token.username = user.username;
                token.isActive = user.isActive;
                token.isAcceptingMessage = user.isAcceptingMessage;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token.id as string;
                session.user.username = token.username as string;
                session.user.isActive = token.isActive as boolean;
                session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
            }
            return session;
        }
},
pages: {
    signIn: "/sign-in",
},
session: {
    strategy: "jwt"
},
secret: process.env.NEXTAUTH_SECRET
}
