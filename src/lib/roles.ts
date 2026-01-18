// Available user roles in the system
export const USER_ROLES = {
  ADMIN: "admin",
  COUNSELOR: "counselor",
  MODERATOR: "moderator",
  STAFF: "staff",
  STUDENT: "student",
  EMPLOYEE: "employee",
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.ADMIN]: 5,
  [USER_ROLES.MODERATOR]: 4,
  [USER_ROLES.STAFF]: 3,
  [USER_ROLES.COUNSELOR]: 2,
  [USER_ROLES.EMPLOYEE]: 2,
  [USER_ROLES.STUDENT]: 1,
}

// Roles that don't require approval (auto-approved)
export const AUTO_APPROVED_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MODERATOR,
  USER_ROLES.STAFF,
  USER_ROLES.EMPLOYEE,
]

// Roles that can be assigned by admin
export const ASSIGNABLE_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MODERATOR,
  USER_ROLES.STAFF,
  USER_ROLES.COUNSELOR,
  USER_ROLES.STUDENT,
  USER_ROLES.EMPLOYEE,
]

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.MODERATOR]: "Moderator",
  [USER_ROLES.STAFF]: "Staff",
  [USER_ROLES.COUNSELOR]: "Counselor",
  [USER_ROLES.STUDENT]: "Student",
  [USER_ROLES.EMPLOYEE]: "Employee",
}

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: "Full system access and user management",
  [USER_ROLES.MODERATOR]: "Can moderate content and reviews",
  [USER_ROLES.STAFF]: "Can manage content and events",
  [USER_ROLES.COUNSELOR]: "Can manage counseling sessions",
  [USER_ROLES.STUDENT]: "Regular user with basic access",
  [USER_ROLES.EMPLOYEE]: "Employee for attendance tracking",
}

// Check if a role has permission to perform an action
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Check if role is auto-approved
export function isAutoApproved(role: UserRole): boolean {
  return AUTO_APPROVED_ROLES.includes(role)
}

