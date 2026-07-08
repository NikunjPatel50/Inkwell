const STORAGE_KEY = "wrytesmart_pending_signup";

interface PendingSignup {
  email: string;
  password: string;
  createdAt: number;
}

const MAX_AGE_MS = 60 * 60 * 1000;

function readRawPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
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

export function savePendingSignup(email: string, password: string): void {
  if (typeof window === "undefined") return;

  const payload: PendingSignup = {
    email,
    password,
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingSignup(): PendingSignup | null {
  return readRawPendingSignup();
}

export function clearPendingSignup(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function tryCompletePendingSignup(
  signIn: (email: string, password: string) => Promise<void>,
): Promise<boolean> {
  const pending = readRawPendingSignup();
  if (!pending) return false;

  try {
    await signIn(pending.email, pending.password);
    clearPendingSignup();
    return true;
  } catch {
    return false;
  }
}
