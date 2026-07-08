import { createAdminClient, createClient } from "@insforge/sdk";
import type { NextRequest } from "next/server";
import { ADMIN_EMAIL } from "./admin";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string;
  isProjectAdmin: boolean;
}

function getAdminEmails(): string[] {
  return [ADMIN_EMAIL];
}

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function getAdminClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Admin API is not configured.");
  }

  return createAdminClient({ baseUrl, apiKey });
}

export async function verifyAdminRequest(
  request: NextRequest,
): Promise<{ email: string } | { error: string; status: number }> {
  const token = getBearerToken(request);
  if (!token) {
    return { error: "Missing authorization token.", status: 401 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) {
    return { error: "Auth is not configured.", status: 500 };
  }

  const userClient = createClient({
    baseUrl,
    anonKey,
    accessToken: token,
  });

  const { data, error } = await userClient.auth.getCurrentUser();
  const email = data?.user?.email?.trim().toLowerCase();
  if (error || !email) {
    return { error: "Invalid or expired session.", status: 401 };
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(email)) {
    return { error: "Forbidden.", status: 403 };
  }

  return { email };
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const admin = getAdminClient();
  const { data, error } = await admin.database
    .schema("auth")
    .from("users")
    .select("id, email, email_verified, created_at, profile, is_project_admin")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "Failed to load users.");
  }

  return (data ?? []).map((row) => {
    const profile = row.profile as { name?: string } | null;
    return {
      id: row.id as string,
      email: row.email as string,
      name: profile?.name?.trim() || null,
      emailVerified: Boolean(row.email_verified),
      createdAt: row.created_at as string,
      isProjectAdmin: Boolean(row.is_project_admin),
    };
  });
}
