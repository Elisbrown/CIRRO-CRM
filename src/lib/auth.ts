import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import type { SystemRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      staffId: string;
      email: string;
      name: string;
      role: SystemRole;
      department: string;
      image: string | null;
    };
  }

  interface User {
    staffId: string;
    role: SystemRole;
    department: string;
    image: string | null;
  }
}

declare module "next-auth" {
  interface JWT {
    staffId: string;
    role: SystemRole;
    department: string;
    image: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const staff = (await db.staff.findUnique({
          where: { email: credentials.email as string },
        })) as any;

        if (!staff || staff.status !== "ACTIVE") return null;

        const passwordMatch = await compare(
          credentials.password as string,
          staff.passwordHash
        );
        if (!passwordMatch) return null;

        return {
          id: String(staff.id),
          staffId: staff.staffId,
          email: staff.email,
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role,
          department: staff.department,
          image: staff.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.staffId = user.staffId;
        token.role = user.role;
        token.department = user.department;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.staffId = token.staffId as string;
        session.user.role = token.role as SystemRole;
        session.user.department = token.department as string;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
});
