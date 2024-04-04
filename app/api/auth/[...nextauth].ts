import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encryptPassword } from "@/utils/security";
import bcrypt from "bcrypt";
import { isValidPassword } from "@/utils/validations";
import { existsUserWithEmail } from "@/models/UserModel";

const getCookiesConfiguration = () => {
  const useSecureCookies =
    process.env.NEXT_PUBLIC_URL?.toLowerCase().startsWith("https");
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  const sameSiteSetting = useSecureCookies ? "none" : "lax";
  return {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: sameSiteSetting,
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: sameSiteSetting,
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      // Default to __Host- for CSRF token for additional protection if using useSecureCookies
      // NB: The `__Host-` prefix is stricter than the `__Secure-` prefix.
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: sameSiteSetting,
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: sameSiteSetting,
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes in seconds
      },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: sameSiteSetting,
        path: "/",
        secure: useSecureCookies,
        maxAge: 60 * 15, // 15 minutes in seconds
      },
    },
  };
};

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login", // Error code passed in query string as ?error=
  },

  providers: [
    // https://next-auth.js.org/providers/credentials
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (props, req) => {
        const { password, email, objectId, token, validateToken } =
          req.body;

        const magicLinkSignIn = !!token;

        try {
          const user = await (
            // validateToken && isValidPassword(password) ?
            //   consumeSignInToken(validateToken)
            //   : magicLinkSignIn
            //     ? getUserByToken(token)
            //     : getUserByEmailForAuthorization(email));

          if (validateToken && isValidPassword(password)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                password: await encryptPassword(password),
              },
            });
          }

          if (user &&
            (magicLinkSignIn ||
              validateToken ||
              (user.password &&
                (await bcrypt.compare(password, user.password))))
          ) {
            return {
              id: user.id.toString(),
              email: user.email,
              image: user.profileImage,
              role: user.role,
            };
          }
        } catch (e) {
          console.error("Error authorizing the user", {
            error: e,
            password,
            email,
            objectId,
            token,
          });
        }

        return null;
      },
    }),
  ],

  jwt: {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  },
  cookies: getCookiesConfiguration(),

  callbacks: {
    async signIn({ account, credentials }) {
      if (account.provider === "credentials") {
        try {
          const { email, token, validateToken } =
            credentials as any;

          if (credentials?.email) {
            const result = await existsUserWithEmail(email);
            return result.exists;
          } else if (token) {
            return true;
          } else if (validateToken) {
            return true;
          }
        } catch (e) {
          console.error(
            "Error when trying to sign in user using its credentials",
            e,
          );
          return false;
        }
      }

      return false;
    },
    jwt: async function ({ token, user }) {
      if (token.id) return token;

      const findUser = await prisma.user.findFirst({
        where: {
          email: user.email?.toLowerCase() || "",
        },
        select: {
          id: true,
          email: true,
        },
      });
      if (findUser) {
        token.id = findUser?.id;
        token.email = user?.email;
        delete token.name;
        delete token.picture;
      }
      return token;
    },

    // https://next-auth.js.org/configuration/callbacks#session-callback
    session: async function ({ session, token }) {
      if (new Date(session.expires) < new Date()) {
        throw new Error("Session expired");
      }

      const user = {} // FInd on the db the user from token.id
      if (!user) {
        throw new Error("User not found");
      }
      session.user = {
        id: user.id,
        // email: user.email,
        // username: user.username,
        // image: user.profileImage,
        // onboardingCompleted: user.onboardingCompleted,
        // language: user.languagePreference,
        // employerMatchMultiplier: user.employer?.matchMultiplier || null,
        // identityVerified: user.identityVerified,
        //employerPath: user.employer?.path || null,
        // displayName:
        //   buildFullName({
        //     firstName: user.firstname,
        //     lastName: user.lastname,
        //   }) || null,
      };
      return session;
    },
  },
};

// noinspection JSUnusedGlobalSymbols
export default NextAuth(authOptions);
