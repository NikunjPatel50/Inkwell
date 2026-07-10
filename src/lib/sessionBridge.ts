const PENDING_ANALYSE_KEY = "wrytesmart-pending-analyse";
const DRAFT_TEXT_KEY = "wrytesmart-draft";
const GUEST_SESSION_KEY = "wrytesmart-guest";

export function saveDraftForLogin(text: string, pendingAnalyse: boolean): void {
  try {
    sessionStorage.setItem(DRAFT_TEXT_KEY, text);
    if (pendingAnalyse) {
      sessionStorage.setItem(PENDING_ANALYSE_KEY, "1");
    }
  } catch {
    // sessionStorage unavailable
  }
}

export function consumeLoginSession(): { text: string | null; pendingAnalyse: boolean } {
  try {
    const text = sessionStorage.getItem(DRAFT_TEXT_KEY);
    const pendingAnalyse = sessionStorage.getItem(PENDING_ANALYSE_KEY) === "1";
    sessionStorage.removeItem(DRAFT_TEXT_KEY);
    sessionStorage.removeItem(PENDING_ANALYSE_KEY);
    return { text, pendingAnalyse };
  } catch {
    return { text: null, pendingAnalyse: false };
  }
}

export function clearLoginSession(): void {
  try {
    sessionStorage.removeItem(DRAFT_TEXT_KEY);
    sessionStorage.removeItem(PENDING_ANALYSE_KEY);
  } catch {
    // sessionStorage unavailable
  }
}

export function enableGuestSession(): void {
  try {
    localStorage.setItem(GUEST_SESSION_KEY, "1");
    sessionStorage.setItem(GUEST_SESSION_KEY, "1");
  } catch {
    // storage unavailable
  }
}

export function isGuestSession(): boolean {
  try {
    return (
      localStorage.getItem(GUEST_SESSION_KEY) === "1" ||
      sessionStorage.getItem(GUEST_SESSION_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function clearGuestSession(): void {
  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
    sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // storage unavailable
  }
}
