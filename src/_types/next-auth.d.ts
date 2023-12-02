import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      token: string;
      type: string;
      refreshToken: string;
      id: string;
      username: string;
      email: string;
      roles: any[] | undefined;
      iat: string;
      exp: string;
      jti: string;
      sub: string;
    };
  }
}
