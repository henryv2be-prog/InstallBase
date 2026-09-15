import { cache } from "react";
import { auth } from "@/lib/auth";

/** Deduplicate session lookups within a single request. */
export const getSession = cache(auth);
