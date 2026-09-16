import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      _id: string
      username: string
      isActive: boolean
      isAcceptingMessage: boolean
    } & DefaultSession["user"]
  }

  interface User {
    _id: string
    username: string
    isActive: boolean
    isAcceptingMessage: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    isActive: boolean
    isAcceptingMessage: boolean
  }
}
