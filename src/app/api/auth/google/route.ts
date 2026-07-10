import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  codeVerifierCookieOptions,
  createInsforgeAuthClient,
  getCodeVerifierCookieName,
  getOAuthCallbackUrl,
} from "@/lib/authServer";

export async function GET(request: NextRequest) {
  try {
    const client = createInsforgeAuthClient();
    const redirectTo = getOAuthCallbackUrl(request);

    const { data, error } = await client.auth.signInWithOAuth("google", {
      redirectTo,
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      const message = error?.message ?? "Could not start Google sign-in.";
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(getCodeVerifierCookieName(), data.codeVerifier, codeVerifierCookieOptions());

    return NextResponse.redirect(data.url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed.";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}
