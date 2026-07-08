/** Only this account can see the Admin button and access /admin */
export const ADMIN_EMAIL = "nicksofficialindia@gmail.com";

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
