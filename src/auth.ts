import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Identifiant", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const username = process.env.AUTH_USERNAME ?? "admin";
        const password = credentials?.password as string | undefined;

        if (!credentials?.username || !password) return null;
        if (credentials.username !== username) return null;

        const passwordHash = process.env.AUTH_PASSWORD_HASH;
        const plainPassword = process.env.AUTH_PASSWORD ?? "admin";

        const valid = passwordHash
          ? await bcrypt.compare(password, passwordHash)
          : password === plainPassword;

        if (!valid) return null;

        return { id: "1", name: username };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
});
