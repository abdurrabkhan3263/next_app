import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login", // HERE WE ARE GOING TO CONTROL THE PAGE WHERE WE WANT TO REDIRECT IT.
  },
  callbacks: {
    // HERE WE ARE GOING TO DEFINE THE CALLBACKS. FOR EXAMPLE:- signIn, signOut, session, jwt, redirect, etc.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        console.log("hello");
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig; // this is used for type checking.
