export function authError(detail: unknown, fallback = "We couldn’t complete that request. Please try again."): string {
  const messages: Record<string, string> = {
    REGISTER_USER_ALREADY_EXISTS: "An account with this email already exists. Sign in instead.",
    LOGIN_BAD_CREDENTIALS: "Your email or password is incorrect.",
    EMAIL_NOT_VERIFIED: "Please verify your email before signing in. Check your inbox for the verification link.",
    LOGIN_USER_NOT_VERIFIED: "Please verify your email before signing in.",
    SOCIAL_NOT_CONFIGURED: "This sign-in option is not available yet. Please use email and password.",
    SOCIAL_CANCELLED: "Sign-in was cancelled. You can try again or use email and password.",
    SOCIAL_INVALID_STATE: "Your sign-in session has expired. Please start again.",
    SOCIAL_FAILED: "We couldn’t verify that sign-in. Please try again.",
    SOCIAL_EMAIL_REQUIRED: "The provider didn’t share a verified email address. Please sign up with email instead.",
    SOCIAL_EXISTING_EMAIL: "This email already has a ContractPros account. Please sign in using your existing method. Accounts are not linked automatically.",
    SOCIAL_ACCOUNT_DISABLED: "This account cannot sign in. Please contact ContractPros support.",
    SOCIAL_EXPIRED: "Your signup session has expired. Please start social sign-in again.",
  };
  if (typeof detail === "string") return messages[detail] ?? fallback;
  if (Array.isArray(detail)) return "Please check that all required fields are filled in correctly.";
  if (detail && typeof detail === "object" && "code" in detail && detail.code === "REGISTER_INVALID_PASSWORD") return "Choose a password with at least 12 characters.";
  return fallback;
}
