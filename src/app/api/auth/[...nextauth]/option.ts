import  CredentialsProvider  from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";



export const authOptions: NextAuthOptions = {
providers: [
  CredentialsProvider({
        id: "credentials",
        name: "Credentials",
         credentials: {
        email: { label: "Email", type: "text"},
        password: { label: "Password", type: "password" }
    },
    async authorize (credentials: any): Promise<any> {
        await dbConnect();

        try {
            const user = await UserModel.findOne({
                $or: [{ email: credentials.identifier },
                { username: credentials.identifier }]
            });

            if (!user) {
                throw new Error("No user found with the given credentials");
            }

            if (!user.isActive) {
                throw new Error("Please activate your account before logging in");
            }

            const isPasswordCorrect = await bcrypt.compare (credentials.password, user.password);

            if (isPasswordCorrect) {
                return user;
            } else {
                throw new Error("Invalid password");
            }
        } catch (err: any) {
            throw new Error(err);
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
                session.user._id = token.id?.toString();
                session.user.username = token.username;
                session.user.isActive = token.isActive;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
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