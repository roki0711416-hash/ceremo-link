import { describe, expect, it } from "vitest";

import { formatYen } from "@/lib/datetime";
import {
  freelancerSignupSchema,
  loginSchema,
  signupRoleSchema,
} from "@/lib/validations/auth";

describe("auth validations", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("allows only public signup roles", () => {
    expect(signupRoleSchema.safeParse("freelancer").success).toBe(true);
    expect(signupRoleSchema.safeParse("funeral_company").success).toBe(true);
    expect(signupRoleSchema.safeParse("admin").success).toBe(false);
  });

  it("requires display name for freelancer signup", () => {
    const result = freelancerSignupSchema.safeParse({
      email: "fl@example.com",
      password: "password1",
      displayName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("formatYen", () => {
  it("formats integer yen", () => {
    expect(formatYen(12000)).toMatch(/12,000/);
  });
});
