import { insforge } from "./insforge";

type AuthWithTokenManager = {
  tokenManager?: {
    getAccessToken(): string | null;
  };
};

export function getClientAccessToken(): string | null {
  const auth = insforge.auth as unknown as AuthWithTokenManager;
  return auth.tokenManager?.getAccessToken() ?? null;
}
