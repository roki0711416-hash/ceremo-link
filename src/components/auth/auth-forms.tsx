"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import {
  loginAction,
  signupFreelancerAction,
  signupFuneralCompanyAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: AuthActionState = {};

function AuthMessage({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-red-50 px-3 py-2 text-base text-required"
      >
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg bg-freelancer-soft px-3 py-2 text-base text-freelancer">
        {state.success}
      </p>
    );
  }
  return null;
}

function FieldShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl border border-input bg-white px-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <AuthMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          メールアドレス
        </Label>
        <FieldShell>
          <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="メールアドレスを入力してください"
            className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </FieldShell>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          パスワード
        </Label>
        <FieldShell>
          <Lock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="パスワードを入力してください"
            className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <button
            type="button"
            className="tap-target inline-flex items-center justify-center text-muted-foreground"
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </FieldShell>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="tap-target h-12 w-full rounded-xl bg-funeral text-base text-white hover:bg-funeral/90"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </Button>
    </form>
  );
}

export function FreelancerSignupForm() {
  const [state, action, pending] = useActionState(
    signupFreelancerAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <AuthMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-base">
          表示名
        </Label>
        <Input
          id="displayName"
          name="displayName"
          required
          maxLength={50}
          className="h-11 rounded-xl text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          メールアドレス
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-xl text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          パスワード（8文字以上）
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-xl text-base"
        />
      </div>
      <Button
        type="submit"
        className="tap-target h-12 w-full rounded-xl bg-freelancer text-base text-white hover:bg-freelancer/90"
        disabled={pending}
      >
        {pending ? "登録中…" : "フリーランスとして登録"}
      </Button>
    </form>
  );
}

export function FuneralCompanySignupForm() {
  const [state, action, pending] = useActionState(
    signupFuneralCompanyAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <AuthMessage state={state} />
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-base">
          会社名
        </Label>
        <Input
          id="companyName"
          name="companyName"
          required
          maxLength={100}
          className="h-11 rounded-xl text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          メールアドレス
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-xl text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          パスワード（8文字以上）
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-xl text-base"
        />
      </div>
      <Button
        type="submit"
        className="tap-target h-12 w-full rounded-xl bg-funeral text-base text-white hover:bg-funeral/90"
        disabled={pending}
      >
        {pending ? "登録中…" : "葬儀社として登録"}
      </Button>
    </form>
  );
}
