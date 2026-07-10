import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_STORAGE_KEY } from "@/lib/authPersistence";
import {
  buildOAuthCompleteHtml,
  createInsforgeAuthClient,
  getCodeVerifierCookieName,
  mapOAuthSession,
} from "@/lib/authServer";

function redirectToLogin(request: NextRequest, error: string): NextResponse {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(error)}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const oauthError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("insforge_code");

  if (oauthError) {
    return redirectToLogin(request, "Google sign-in was cancelled.");
  }

  if (!code) {
    return redirectToLogin(request, "Missing Google sign-in code.");
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(getCodeVerifierCookieName())?.value;
  if (!codeVerifier) {
    return redirectToLogin(
      request,
      "Google sign-in expired. Please try again.",
    );
  }

  try {
    const client = createInsforgeAuthClient();
    const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier);

    cookieStore.delete(getCodeVerifierCookieName());

    if (error || !data?.accessToken || !data.user) {
      const message = error?.message ?? "Could not complete Google sign-in.";
      return redirectToLogin(request, message);
    }

    const session = mapOAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });

    return new NextResponse(buildOAuthCompleteHtml(session, AUTH_STORAGE_KEY), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    cookieStore.delete(getCodeVerifierCookieName());
    const message = err instanceof Error ? err.message : "Google sign-in failed.";
    return redirectToLogin(request, message);
  }
}
