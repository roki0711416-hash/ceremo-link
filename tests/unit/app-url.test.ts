import { afterEach, describe, expect, it } from "vitest";

import {
  getAppUrl,
  getAuthCallbackUrl,
  getPasswordResetRedirectUrl,
} from "@/lib/app-url";

describe("app url helpers", () => {
  const original = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = original;
    }
  });

  it("uses NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";
    expect(getAppUrl()).toBe("http://localhost:3001");
    expect(getAuthCallbackUrl("/freelancer")).toBe(
      "http://localhost:3001/auth/callback?next=%2Ffreelancer",
    );
    expect(getPasswordResetRedirectUrl()).toContain("localhost:3001");
    expect(getPasswordResetRedirectUrl()).toContain("/auth/callback");
  });

  it("strips trailing slash from env", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001/";
    expect(getAppUrl()).toBe("http://localhost:3001");
  });

  it("defaults to localhost:3001 when env missing", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getAppUrl()).toBe("http://localhost:3001");
  });
});
