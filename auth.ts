// In auth.js we are going to use the NextAuth function to create the authentication middleware. We are going to pass the authConfig to the NextAuth function. We are going to export the auth function from the middleware.ts file. We are going to use the auth function in the config object to create the middleware. We are going to use the matcher property to define the routes where the middleware should be applied. We are going to use a regular expression to match all routes except the ones that start with /api, /_next/static, /_next/image, and end with .png.

import NextAuth, { CredentialsSignin } from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identify or password";
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig, // HERE WE ARE GOING TO PASS THE AUTH CONFIGURATION.ALSO WE CAN DIRECTLY PASS THE CONFIGURATION HERE.
  providers: [
    // WE HAVE TO ADD ALL PROVIDERS HERE.
    Credentials({
      // HERE WE ARE GOING TO USE THE CREDENTIALS PROVIDER TO AUTHENTICATE THE USER. [maybe:-  facebook, google, etc]
      id: "credentials", // Not required but used to identify this provider in callbacks
      name: "Credentials", // Name to display on the sign in form
      async authorize(credentials) {
        // Here we define how the user is authenticated.
        // This will provide the credentials to the authorize function. like email and password.
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          try {
            const user = await getUser(email);
            if (!user) throw new InvalidLoginError();
            const isCorrectPass = await bcrypt.compare(password, user.password);
            if (isCorrectPass) return user;
          } catch (error) {
            throw new Error("Failed to authenticate user.");
          }
        }
        return null;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
