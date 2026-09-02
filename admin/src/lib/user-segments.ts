import type { AccountType } from "@royal-vacation/api-client";

/**
 * A slice of the user base surfaced as its own admin screen. `accountType` is
 * the server-side filter; `roleNames` (when set) narrows the result further on
 * the client by the role codes on `user.roles`. `super_admin`, `admin`,
 * `manager`, `content_editor`, `support`, `partner` and `traveler` are the roles
 * seeded in `backend/sql/002_roles.sql`.
 */
export interface UserSegment {
  key: string;
  title: string;
  description: string;
  accountType: AccountType;
  /** Role codes to keep; omit to show every user of `accountType`. */
  roleNames?: string[];
  /** Shown when `roleNames` is set but nothing matches. */
  emptyHint?: string;
  /** Role codes offered in the "Add user" sheet; omit for all active roles. */
  addRoleNames?: string[];
}

export const userSegments = {
  travelers: {
    key: "travelers",
    title: "Travelers",
    description: "Customer accounts used to browse and book stays.",
    accountType: "traveler",
    addRoleNames: ["traveler"],
  },
  "property-agents": {
    key: "property-agents",
    title: "Property Agents",
    description: "Partner accounts that list and manage properties on the platform.",
    accountType: "partner",
    addRoleNames: ["partner"],
  },
  employees: {
    key: "employees",
    title: "Employees",
    description: "Staff accounts running day-to-day operations and content.",
    accountType: "admin",
    roleNames: ["manager", "content_editor", "support"],
    emptyHint: "No employee accounts yet — staff with a Manager, Content Editor or Support Agent role will appear here.",
    addRoleNames: ["manager", "content_editor", "support"],
  },
  suppliers: {
    key: "suppliers",
    title: "Suppliers",
    description: "Accounts for third-party inventory and service suppliers.",
    accountType: "admin",
    roleNames: ["supplier"],
    emptyHint: "Supplier accounts aren't modeled yet — there's no \"supplier\" role seeded in the platform. This screen will populate once one is added.",
    addRoleNames: ["supplier"],
  },
  admins: {
    key: "admins",
    title: "Admin Users",
    description: "Platform administrators with full admin-panel access.",
    accountType: "admin",
    roleNames: ["super_admin", "admin"],
    emptyHint: "No administrator accounts match your filters.",
    addRoleNames: ["super_admin", "admin"],
  },
} satisfies Record<string, UserSegment>;

export type UserSegmentKey = keyof typeof userSegments;
