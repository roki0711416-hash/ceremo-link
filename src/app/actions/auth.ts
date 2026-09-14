"use server";

import { redirect } from "next/navigation";

import {
  mapResetPasswordError,
  mapSignupError,
  type SignupAuthResult,
} from "@/lib/auth/map-auth-error";
import { getAuthCallbackUrl, getPasswordResetRedirectUrl } from "@/lib/app-url";
import { dashboardPathForRole } from "@/lib/constants/roles";
import { createClient } from "@/lib/supabase/server";
import {
  freelancerSignupSchema,
  funeralCompanySignupSchema,
  loginSchema,
} from "@/lib/validations/auth";
import { z } from "zod";
import type { UserRole } from "@/types/database";

export type AuthActionState = {
  error?: string;
  success?: string;
};

async function fetchOwnProfileRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ role: UserRole | null; errorCode?: string; errorMessage?: string }> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      role: null,
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  return { role: profile?.role ?? null };
}

function profileFetchFailureMessage(code?: string, message?: string): string {
  const parts = ["プロフィールの取得に失敗しました"];
  if (code) parts.push(`(${code})`);
  if (message && !/@/.test(message) && message.length < 120) {
    parts.push(message);
  }
  return parts.join(" ");
}

function toSignupResult(
  data: {
    user: { id: string; identities?: { id: string }[] | null } | null;
    session: unknown;
  } | null,
): SignupAuthResult {
  return {
    userId: data?.user?.id ?? null,
    hasSession: Boolean(data?.session),
    identitiesCount: data?.user
      ? (data.user.identities?.length ?? 0)
      : null,
  };
}

async function ensureProfileAfterSignup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { role, errorCode } = await fetchOwnProfileRole(supabase, userId);
  if (errorCode) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[auth:signup] profile_check ${errorCode}`);
    }
    return "アカウントのプロフィール作成に失敗しました。時間をおいて再度お試しいただくか、別のメールアドレスでお試しください。";
  }
  if (!role) {
    if (process.env.NODE_ENV === "development") {
      console.error("[auth:signup] profile_check profile_missing");
    }
    return "アカウントのプロフィール作成に失敗しました。時間をおいて再度お試しいただくか、別のメールアドレスでお試しください。";
  }
  return null;
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword(
    parsed.data,
  );

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません" };
  }

  const userId = signInData.user?.id;
  if (!userId) {
    return { error: profileFetchFailureMessage("no_user") };
  }

  const { role, errorCode, errorMessage } = await fetchOwnProfileRole(
    supabase,
    userId,
  );

  if (errorCode) {
    return {
      error: profileFetchFailureMessage(errorCode, errorMessage),
    };
  }

  if (!role) {
    return { error: profileFetchFailureMessage("PGRST116", "profile_not_found") };
  }

  redirect(dashboardPathForRole(role));
}

export async function signupFreelancerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = freelancerSignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const supabase = await createClient();
  const emailRedirectTo = getAuthCallbackUrl("/freelancer");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: {
        role: "freelancer",
        display_name: parsed.data.displayName,
      },
    },
  });

  const mapped = mapSignupError(error, toSignupResult(data));
  if (mapped) {
    return { error: mapped };
  }

  if (data.session && data.user?.id) {
    const profileError = await ensureProfileAfterSignup(supabase, data.user.id);
    if (profileError) {
      return { error: profileError };
    }
    redirect("/freelancer");
  }

  return {
    success:
      "確認メールを送信しました。メール内のリンクから認証を完了してください。",
  };
}

export async function signupFuneralCompanyAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = funeralCompanySignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const supabase = await createClient();
  const emailRedirectTo = getAuthCallbackUrl("/funeral-company");
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo,
      data: {
        role: "funeral_company",
        company_name: parsed.data.companyName,
      },
    },
  });

  const mapped = mapSignupError(error, toSignupResult(data));
  if (mapped) {
    return { error: mapped };
  }

  if (data.session && data.user?.id) {
    const profileError = await ensureProfileAfterSignup(supabase, data.user.id);
    if (profileError) {
      return { error: profileError };
    }
    redirect("/funeral-company");
  }

  return {
    success:
      "確認メールを送信しました。メール内のリンクから認証を完了してください。",
  };
}

const resetPasswordSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });

  if (error) {
    return { error: mapResetPasswordError(error) };
  }

  return {
    success:
      "パスワード再設定用のメールを送信しました。メール内のリンクから手続きを続けてください。",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
