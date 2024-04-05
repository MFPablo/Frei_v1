import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import prisma from "@/utils/prismaClient";

const handler = NextAuth({
  callbacks: {
    session: async function({ session, token }) {
      if (new Date(session.expires) < new Date()) {
        throw new Error("Session expired");
      }

      const user = await prisma.user.findUnique({
        where: {
          id: token?.sub,
        },
        select: {
          id: true,
          email: true,
          image: true,
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      session.user = {
        id: user.id ?? "",
        name: "test",
        email: user.email ?? "",
        image: user?.image ?? "",
      };
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email
          },
          select: {
            id: true,
            email: true,
            password: true,
          }
        })

        const passwordCorrect = await compare(
          credentials?.password || '',
          user?.password ?? ''
        );

        console.log({ passwordCorrect });

        if (user && passwordCorrect) {
          return {
            id: user?.id,
            email: user?.email,
          };
        }

        return null;
      },
    }),
  ],
});

export { handler as GET, handler as POST };
