import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users, employees } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { isAutoApproved, type UserRole } from "@/lib/roles"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // First, try to find in users table
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        if (user.length > 0) {
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user[0].password || ""
          )

          if (!isValid) {
            return null
          }

          // Check if user is approved (auto-approved roles don't need approval)
          const userRole = (user[0].role || "student") as UserRole
          if (!isAutoApproved(userRole) && !user[0].isApproved) {
            // Return null with a custom error that will be caught
            throw new Error("PENDING_APPROVAL")
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].name,
            role: user[0].role || "student",
          }
        }

        // If not found in users, check employees table
        const employee = await db
          .select()
          .from(employees)
          .where(eq(employees.email, credentials.email as string))
          .limit(1)

        if (employee.length === 0) {
          return null
        }

        // Check if employee is active
        if (!employee[0].isActive) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          employee[0].password || ""
        )

        if (!isValid) {
          return null
        }

        // Return employee as user with "employee" role
        return {
          id: `emp_${employee[0].id.toString()}`,
          email: employee[0].email,
          name: employee[0].name,
          role: "employee",
          employeeId: employee[0].employeeId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "student"
        // Store employee ID if it's an employee login
        if ((user as any).employeeId) {
          token.employeeId = (user as any).employeeId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = (token.role as string) || "student"
        // Include employee ID in session if available
        if (token.employeeId) {
          ;(session.user as any).employeeId = token.employeeId as string
        }
      }
      return session
    },
  },
})

