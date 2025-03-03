import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByEmail } from "@/lib/db-helpers"
import bcrypt from "bcryptjs"
import { startScheduledTasks } from "@/lib/scheduled-tasks"
import { connectToDatabase } from "@/lib/mongodb"

interface User extends NextAuthUser {
  role: string
  isApproved: boolean
  isActive: boolean
  customerId?: string
  companyId?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password")
          return null
        }

        try {
          // Ensure database connection
          await connectToDatabase()

          const user = await getUserByEmail(credentials.email)

          if (!user) {
            console.log(`User not found for email: ${credentials.email}`)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log(`Invalid password for user: ${credentials.email}`)
            return null
          }

          if (user.role === "admin") {
            console.log(`Admin user logged in: ${credentials.email}`)
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.fullName,
              role: user.role,
              isApproved: true,
              isActive: true,
            }
          }

          // For non-admin users, proceed with the existing checks
          if (!user.isVerified || !user.isActive || !user.isApproved) {
            console.log(`User not verified, active, or approved: ${credentials.email}`)
            return null
          }

          console.log(`User successfully authenticated: ${credentials.email}`)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
            isApproved: user.isApproved,
            isActive: user.isActive,
            customerId: user.customerId?.toString(),
            companyId: user.companyId?.toString(),
          }
        } catch (error) {
          console.error("Error during authorization:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isApproved = (user as User).isApproved
        token.isActive = (user as User).isActive
        token.customerId = (user as User).customerId
        token.companyId = (user as User).companyId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
        session.user.isActive = token.isActive as boolean
        session.user.customerId = token.customerId as string
        session.user.companyId = token.companyId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

// Start scheduled tasks when the auth route is first accessed
startScheduledTasks()

export { handler as GET, handler as POST }

