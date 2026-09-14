import type { AuthError } from "@supabase/supabase-js";

export type SignupAuthResult = {
  userId: string | null;
  hasSession: boolean;
  /** When confirm-email is on, duplicate signups often return a user with empty identities. */
  identitiesCount: number | null;
};

/**
 * Log only machine codes in development. Never log emails, tokens, or passwords.
 */
export function logAuthErrorCode(
  context: string,
  code: string | undefined,
  status?: number,
) {
  if (process.env.NODE_ENV !== "development") return;
  const parts = [`[auth:${context}]`, code ?? "unknown_code"];
  if (typeof status === "number") parts.push(`status=${status}`);
  console.error(parts.join(" "));
}

function normalizeCode(error: AuthError): string {
  const raw = (error.code ?? "").toLowerCase().trim();
  if (raw) return raw;

  const msg = (error.message ?? "").toLowerCase();

  if (
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already exists") ||
    msg.includes("email address has already been registered")
  ) {
    return "email_exists";
  }
  if (
    msg.includes("rate limit") ||
    msg.includes("email rate") ||
    msg.includes("over_email_send_rate_limit")
  ) {
    return "over_email_send_rate_limit";
  }
  if (msg.includes("weak password") || msg.includes("password should be")) {
    return "weak_password";
  }
  if (
    msg.includes("database error saving new user") ||
    msg.includes("database error checking email") ||
    msg.includes("unexpected_failure")
  ) {
    return "profile_create_failed";
  }
  if (
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("failed to fetch")
  ) {
    return "network_error";
  }

  return "unknown";
}

/**
 * Map Supabase Auth / signup outcomes to Japanese user-facing messages.
 * Does not include emails or other PII.
 */
export function mapSignupError(
  error: AuthError | null,
  result?: SignupAuthResult | null,
): string | null {
  if (error) {
    const code = normalizeCode(error);
    logAuthErrorCode("signup", code, error.status);

    switch (code) {
      case "email_exists":
      case "user_already_exists":
        return "このメールアドレスは既に登録されています。ログインするか、別のメールアドレスをお使いください。";
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return "メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください。";
      case "weak_password":
        return "パスワードが条件を満たしていません。8文字以上で、より安全なパスワードを設定してください。";
      case "profile_create_failed":
      case "unexpected_failure":
        return "アカウントのプロフィール作成に失敗しました。時間をおいて再度お試しいただくか、別のメールアドレスでお試しください。";
      case "signup_disabled":
      case "email_provider_disabled":
        return "現在、新規登録を受け付けていません。";
      case "email_address_invalid":
      case "validation_failed":
        return "メールアドレスの形式が正しくありません。";
      case "network_error":
        return "通信エラーが発生しました。ネットワーク接続を確認して再度お試しください。";
      default:
        // status 5xx → treat as communication / server issue
        if (error.status && error.status >= 500) {
          return "通信エラーが発生しました。時間をおいて再度お試しください。";
        }
        return "登録に失敗しました。時間をおいて再度お試しください。";
    }
  }

  // Duplicate email obfuscation when email confirmation is enabled
  if (
    result &&
    result.userId &&
    result.identitiesCount === 0 &&
    !result.hasSession
  ) {
    logAuthErrorCode("signup", "email_exists_obfuscated");
    return "このメールアドレスは既に登録されています。ログインするか、別のメールアドレスをお使いください。";
  }

  return null;
}

export function mapResetPasswordError(error: AuthError): string {
  const code = normalizeCode(error);
  logAuthErrorCode("reset_password", code, error.status);

  switch (code) {
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "メール送信回数の上限に達しました。しばらく時間をおいてから再度お試しください。";
    case "network_error":
      return "通信エラーが発生しました。ネットワーク接続を確認して再度お試しください。";
    default:
      if (error.status && error.status >= 500) {
        return "通信エラーが発生しました。時間をおいて再度お試しください。";
      }
      return "リセットメールの送信に失敗しました。";
  }
}
