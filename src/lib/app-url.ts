/**
 * App base URL from env. Never hardcode production hosts.
 * Dev default matches CeremoLink on port 3001.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3001";
}

export function getAuthCallbackUrl(nextPath = "/"): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const url = new URL("/auth/callback", `${getAppUrl()}/`);
  if (next !== "/") {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

export function getPasswordResetRedirectUrl(): string {
  return getAuthCallbackUrl("/login");
}
