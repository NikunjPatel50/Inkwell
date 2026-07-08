import { insforge } from "./insforge";
import { validatePassword } from "./passwordPolicy";

export async function verifyCurrentPassword(email: string, currentPassword: string): Promise<void> {
  const { error } = await insforge.auth.signInWithPassword({ email, password: currentPassword });
  if (error) {
    throw new Error("Current password is incorrect.");
  }
}

export async function sendPasswordChangeCode(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/login`;
  const { error } = await insforge.auth.sendResetPasswordEmail({ email, redirectTo });
  if (error) {
    throw new Error(error.message ?? "Failed to send verification code.");
  }
}

export async function completePasswordChange(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const { data, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({
    email,
    code: code.trim(),
  });

  if (exchangeError || !data?.token) {
    throw new Error(exchangeError?.message ?? "Invalid or expired verification code.");
  }

  const { error: resetError } = await insforge.auth.resetPassword({
    newPassword,
    otp: data.token,
  });

  if (resetError) {
    throw new Error(resetError.message ?? "Failed to update password.");
  }
}
