import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type ClientType = {
  clientId: string;
  clientSecret: string;
};

const authOptions: NextAuthOptions = {
  theme: {
    logo: "/seed-default.png",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    } as ClientType),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.ALLOWED_USER_EMAIL_ADDRESS;

      // 許可リストに含まれていないメールアドレスの場合、ログインを拒否
      if (allowedEmail != user.email) {
        console.log(`ログイン拒否: ${user.email}`);
        return false;
      }

      console.log(`ログイン成功: ${user.email}`);
      return true; // ログイン許可
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
