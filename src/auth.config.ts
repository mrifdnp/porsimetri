import type { NextAuthConfig } from "next-auth";

// Config ringan — TANPA import db/fs, aman untuk Edge Runtime (middleware)
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = (auth?.user as { role?: string } | undefined)?.role;

      if (pathname.startsWith("/dashboard")) {
        if (!auth) return Response.redirect(new URL("/login", request.url));
        if (pathname.startsWith("/dashboard/admin") && role !== "admin")
          return Response.redirect(new URL("/dashboard", request.url));
        if (pathname.startsWith("/dashboard/nakes") && role !== "nakes")
          return Response.redirect(new URL("/dashboard", request.url));
        if (pathname.startsWith("/dashboard/user") && role !== "user")
          return Response.redirect(new URL("/dashboard", request.url));
      }

      if ((pathname === "/login" || pathname.startsWith("/register")) && auth)
        return Response.redirect(new URL("/dashboard", request.url));

      return true;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};
