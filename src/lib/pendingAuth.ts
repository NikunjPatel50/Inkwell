const STORAGE_KEY = "wrytesmart_pending_verification";

interface PendingVerification {
  email: string;
  createdAt: number;
}

const MAX_AGE_MS = 60 * 60 * 1000;

function readRawPendingVerification(): PendingVerification | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const payload = JSON.parse(raw) as PendingVerification;
    if (!payload.email || !payload.createdAt) {
      clearPendingVerification();
      return null;
    }

    if (Date.now() - payload.createdAt > MAX_AGE_MS) {
      clearPendingVerification();
      return null;
    }

    return payload;
  } catch {
    clearPendingVerification();
    return null;
  }
}

export function savePendingVerification(email: string): void {
  if (typeof window === "undefined") return;

  const payload: PendingVerification = {
    email,
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingVerification(): string | null {
  return readRawPendingVerification()?.email ?? null;
}

export function clearPendingVerification(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
