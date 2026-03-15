"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
  extractClerkMessage,
  isClerkIdentifierExistsError,
  normalizeIdentifierForClerkUsername,
  normalizePasswordForClerk,
  type SchoolRole,
} from "./action-functions";

type ClerkApiError = {
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
};

type CreateClerkUserInput = {
  firstName: string;
  lastName: string;
  identifier: string;
  role: SchoolRole;
  email?: string | null;
  password?: string;
};

export async function createClerkUser({
  firstName,
  lastName,
  identifier,
  role,
  email,
  password,
}: CreateClerkUserInput) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "CLERK_SECRET_KEY is missing. Set it in your server environment."
    );
  }

  const client = await clerkClient();
  const username = normalizeIdentifierForClerkUsername(identifier);
  const tempPassword = normalizePasswordForClerk(password ?? identifier);

  if (!username) {
    throw new Error("Identifier cannot be converted to a valid Clerk username.");
  }

  const payloadVariants: Array<Record<string, unknown>> = [
    {
      firstName,
      lastName,
      username,
      ...(email ? { emailAddress: [email] } : {}),
      password: tempPassword,
      publicMetadata: { role, identifier },
    },
    {
      firstName,
      lastName,
      username,
      password: tempPassword,
      publicMetadata: { role, identifier },
    },
  ];

  let lastError: unknown = null;

  for (const payload of payloadVariants) {
    try {
      const user = await client.users.createUser(payload);
      await client.users.updateUser(user.id, {
        publicMetadata: { role, identifier },
      });

      return { user, username, tempPassword };
    } catch (error: unknown) {
      lastError = error;

      if (isClerkIdentifierExistsError(error)) {
        throw error;
      }

      const clerkErrors =
        typeof error === "object" && error !== null && "errors" in error
          ? (error as ClerkApiError).errors
          : undefined;

      const hasUnknownField = clerkErrors?.some(
        (item) =>
          item?.code === "form_param_unknown" ||
          item?.message?.toLowerCase().includes("unknown")
      );

      if (hasUnknownField) {
        continue;
      }

      throw new Error(extractClerkMessage(error));
    }
  }

  throw new Error(extractClerkMessage(lastError));
}

export async function deleteClerkUserIfExists(clerkUserId: string) {
  const client = await clerkClient();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await client.users.deleteUser(clerkUserId);
      return;
    } catch (error: unknown) {
      const clerkErrors =
        typeof error === "object" && error !== null && "errors" in error
          ? (error as ClerkApiError).errors
          : undefined;

      const notFound = clerkErrors?.some(
        (item) =>
          item?.code === "resource_not_found" ||
          item?.message?.toLowerCase().includes("not found")
      );

      if (notFound) {
        return;
      }

      if (attempt === 3) {
        console.error("Failed to delete Clerk user after retries", {
          clerkUserId,
          error,
        });
        throw error;
      }
    }
  }
}
