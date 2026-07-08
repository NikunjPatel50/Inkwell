const LOGIN_PATH = "/login";

export function getLoginRedirectUrl(): string {
  if (typeof window === "undefined") {
    return LOGIN_PATH;
  }

  return `${window.location.origin}${LOGIN_PATH}`;
}

export type EmailVerificationCallback = {
  type: "verify_email";
  status: "success" | "error";
  error?: string;
};

export function parseEmailVerificationCallback(
  search: string,
): EmailVerificationCallback | null {
  const params = new URLSearchParams(search);
  if (params.get("insforge_type") !== "verify_email") {
    return null;
  }

  const status = params.get("insforge_status");
  if (status !== "success" && status !== "error") {
    return null;
  }

  return {
    type: "verify_email",
    status,
    error: params.get("insforge_error") ?? undefined,
  };
}

export function clearEmailVerificationCallbackParams(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("insforge_type");
  url.searchParams.delete("insforge_status");
  url.searchParams.delete("insforge_error");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}
