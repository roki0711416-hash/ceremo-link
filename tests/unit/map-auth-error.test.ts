import { afterEach, describe, expect, it, vi } from "vitest";

import {
  mapResetPasswordError,
  mapSignupError,
} from "@/lib/auth/map-auth-error";
import type { AuthError } from "@supabase/supabase-js";

function authError(
  partial: Partial<AuthError> & { message: string },
): AuthError {
  return {
    name: "AuthApiError",
    status: 400,
    code: undefined,
    ...partial,
  } as AuthError;
}

describe("mapSignupError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("maps email_exists", () => {
    const msg = mapSignupError(
      authError({ code: "email_exists", message: "Email exists" }),
    );
    expect(msg).toContain("既に登録されています");
  });

  it("maps over_email_send_rate_limit", () => {
    const msg = mapSignupError(
      authError({
        code: "over_email_send_rate_limit",
        message: "email rate limit exceeded",
      }),
    );
    expect(msg).toContain("メール送信回数");
  });

  it("maps weak_password", () => {
    const msg = mapSignupError(
      authError({ code: "weak_password", message: "Password is too weak" }),
    );
    expect(msg).toContain("パスワードが条件");
  });

  it("maps database error as profile create failure", () => {
    const msg = mapSignupError(
      authError({
        message: "Database error saving new user",
        status: 500,
      }),
    );
    expect(msg).toContain("プロフィール作成に失敗");
  });

  it("maps network-like messages", () => {
    const msg = mapSignupError(
      authError({ message: "Failed to fetch", status: 0 }),
    );
    expect(msg).toContain("通信エラー");
  });

  it("detects obfuscated duplicate signup (empty identities)", () => {
    const msg = mapSignupError(null, {
      userId: "11111111-1111-4111-8111-111111111111",
      hasSession: false,
      identitiesCount: 0,
    });
    expect(msg).toContain("既に登録されています");
  });

  it("logs only codes in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mapSignupError(
      authError({ code: "email_exists", message: "user@example.com exists" }),
    );
    expect(spy).toHaveBeenCalled();
    const logged = String(spy.mock.calls[0]?.[0] ?? "");
    expect(logged).toContain("email_exists");
    expect(logged).not.toContain("@");
    vi.unstubAllEnvs();
  });
});

describe("mapResetPasswordError", () => {
  it("maps rate limit", () => {
    const msg = mapResetPasswordError(
      authError({
        code: "over_email_send_rate_limit",
        message: "rate limit",
      }),
    );
    expect(msg).toContain("メール送信回数");
  });
});
