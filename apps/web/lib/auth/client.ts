"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// The Next adapter talks only to /api/auth. The Neon endpoint and the signing
// secret remain server-only, so they never reach the browser bundle.
export const authClient = createAuthClient();
