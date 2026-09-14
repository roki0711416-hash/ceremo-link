import type { UserRole } from "@/types/database";

export const ROLE_LABELS: Record<UserRole, string> = {
  freelancer: "フリーランス",
  funeral_company: "葬儀社",
  admin: "運営管理者",
};

export function dashboardPathForRole(role: UserRole) {
  switch (role) {
    case "freelancer":
      return "/freelancer";
    case "funeral_company":
      return "/funeral-company";
    case "admin":
      return "/admin";
  }
}
