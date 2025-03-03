import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail } from "./db-helpers"
import bcrypt from "bcryptjs"
import crypto from 'crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await getUserByEmail(credentials.email)
        if (!user) {
          throw new Error("No user found with this email")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid email or password")
        }

        if (!user.isVerified) {
          throw new Error("Email not verified")
        }

        if (!user.isApproved) {
          throw new Error("Account not approved")
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
          isApproved: user.isApproved,
          isActive: user.isActive,
          customerId: user.customerId ? user.customerId.toString() : undefined,
          companyId: user.companyId ? user.companyId.toString() : undefined
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.isApproved = user.isApproved
        token.isActive = user.isActive
        token.customerId = user.customerId
        token.companyId = user.companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
        session.user.isActive = token.isActive as boolean
        session.user.customerId = token.customerId as string
        session.user.companyId = token.companyId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Store the hashed token in the database
  // This is a placeholder - you should implement the actual storage
  // await storePasswordResetToken(userId, hashedToken, new Date(Date.now() + 3600000)) // 1 hour expiration

  return resetToken
}

export default authOptions

