import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { authConfig } from "./auth.config";

class InvalidLoginError extends CredentialsSignin {
  code = "Username atau password salah.";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new InvalidLoginError();
        const user = await getUserByEmail(credentials.email as string);
        if (!user) throw new InvalidLoginError();
        const valid = await bcrypt.compare(credentials.password as string, (user as any).password_hash || (user as any).passwordHash);
        if (!valid) throw new InvalidLoginError();
        return {
          id: user.id,
          email: user.email,
          name: (user as any).nama_lengkap || user.namaLengkap,
          role: user.role,
        };
      },
    }),
  ],
});
