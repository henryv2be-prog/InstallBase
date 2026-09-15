"use client";

import { signOut } from "next-auth/react";

/** Sign out and land on the current origin (avoids bad AUTH_URL redirects on Railway). */
export async function logout(destination = "/") {
  try {
    await signOut({ redirect: false, callbackUrl: destination });
  } finally {
    window.location.assign(destination);
  }
}
