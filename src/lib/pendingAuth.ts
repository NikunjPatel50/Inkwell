const STORAGE_KEY = "wrytesmart_pending_signup";

interface PendingSignup {
  email: string;
  password: string;
  createdAt: number;
}

const MAX_AGE_MS = 30 * 60 * 1000;

export function savePendingSignup(email: string, password: string): void {
  if (typeof window === "undefined") return;

  const payload: PendingSignup = {
    email,
    password,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as PendingSignup;
    if (!payload.email || !payload.password || !payload.createdAt) {
      clearPendingSignup();
      return null;
    }

    if (Date.now() - payload.createdAt > MAX_AGE_MS) {
      clearPendingSignup();
      return null;
    }

    return payload;
  } catch {
    clearPendingSignup();
    return null;
  }
}

export function clearPendingSignup(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
