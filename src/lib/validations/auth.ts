import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

export const signupRoleSchema = z.enum(["freelancer", "funeral_company"]);

export const freelancerSignupSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
  displayName: z
    .string()
    .trim()
    .min(1, "表示名を入力してください")
    .max(50, "表示名は50文字以内にしてください"),
});

export const funeralCompanySignupSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
  companyName: z
    .string()
    .trim()
    .min(1, "会社名を入力してください")
    .max(100, "会社名は100文字以内にしてください"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type FreelancerSignupInput = z.infer<typeof freelancerSignupSchema>;
export type FuneralCompanySignupInput = z.infer<
  typeof funeralCompanySignupSchema
>;
