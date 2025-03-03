import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      customerId?: string
      companyId?: string
      isApproved: boolean
      isActive: boolean
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    customerId?: string
    companyId?: string
    isApproved: boolean
    isActive: boolean
  }
}

