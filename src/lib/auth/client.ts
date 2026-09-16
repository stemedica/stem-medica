"use client";
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({ basePath: "/test/api/auth", plugins: [twoFactorClient()] });
