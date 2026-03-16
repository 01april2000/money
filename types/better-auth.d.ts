import type { Role } from "@prisma/client"

declare module "better-auth" {
  interface User {
    role: Role
    santriId?: string
  }
}

declare module "better-auth/react" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      emailVerified: boolean
      image: string | null
      role: Role
      santriId?: string
    }
  }
}
