import jwt_decode from "jwt-decode";
import type { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseUrl: string = process.env.NEXT_PUBLIC_API_URL + "/auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const res: Response = await fetch(`${baseUrl}/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "1",
          },
          body: JSON.stringify({
            username: credentials?.username,
            password: credentials?.password,
          }),
        });
        const user = await res.json();

        if (res.status == 200 && user) {
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          // return null;
          await Promise.reject(new Error("bad credentials"));
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (token.token) {
        let backendToken: any = jwt_decode(token.token);
        let currentTime: number = Math.floor(Date.now() / 1000);
        let daySeconds: number = 86400;

        if (backendToken.exp > currentTime) {
          //ici token pas expiré
          // console.log("ici token pas expiré")
          if (currentTime - backendToken.iat < daySeconds) {
            //ici token déjà demandé dans les 24h
            // console.log("ici token déjà demandé dans les 24h")
            return { ...token, ...user };
          } else if (currentTime - backendToken.iat > daySeconds) {
            //ici token demandé il y a plus de 24h donc demander un nouveau token
            // console.log("ici token demandé il y a plus de 24h donc demander un nouveau token")
            const response = await fetch(`${baseUrl}/refresh-token`, {
              method: "POST",
              next: { revalidate: 10 },
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.token}`,
                "ngrok-skip-browser-warning": "1",
              },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();

              token.token = data.accessToken;
            } else {
              throw new Error("Failed to fetch refresh token");
            }

            return { ...token, ...user };
          }
        }
      }
      return { ...token, ...user };
    },
    async session({ session, token }): Promise<Session> {
      session.user = token as any;
      return session;
    },
  },
};
