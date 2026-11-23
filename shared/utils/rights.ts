import type { User } from "#auth-utils";

export type Role = User["role"];

export function isPaidExamAllowed(role: Role) {
  return role == "süsteemihaldaja";
}

export function isExaminerNameAllowed(role: Role) {
  return role == "süsteemihaldaja" || role == "haldaja";
}
