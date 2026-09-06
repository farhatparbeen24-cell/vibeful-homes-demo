import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the Vibeful Homes admin dashboard.",
};

export default function Page() {
  return <LoginClient />;
}