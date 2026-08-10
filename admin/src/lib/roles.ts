"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  Newspaper,
  PanelsTopLeft,
  Plug,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import {
  mockAdminRoles,
  mockAdminUsers,
  createPermissions,
  type AdminRole,
  type AdminUserRecord,
  type ModuleKey,
  type PermissionAction,
  type Permissions,
} from "@/lib/mock-data";
import { getSession } from "@/lib/auth";

const ROLES_KEY = "rv_admin_roles";
const USERS_KEY = "rv_admin_users";

export interface PermissionModuleMeta {
  key: ModuleKey;
  label: string;
  description: string;
}

export const permissionModules: PermissionModuleMeta[] = [
  { key: "dashboard", label: "Dashboard", description: "Overview metrics and reports." },
  { key: "properties", label: "Properties", description: "Property listings and availability." },
  { key: "bookings", label: "Bookings", description: "Reservations and payouts." },
  { key: "guests", label: "Guests", description: "Guest profiles and communication." },
  { key: "modules", label: "Integrations", description: "Third-party API providers." },
  { key: "cms", label: "CMS", description: "Site pages and menus." },
  { key: "blog", label: "Blog", description: "Posts and categories." },
  { key: "reports", label: "Reports", description: "Finance, occupancy and payout analytics." },
  { key: "payments", label: "Payments", description: "Transactions, invoices and refunds." },
  { key: "settings", label: "Settings", description: "Currency, language, payments." },
  { key: "roles", label: "Roles & Permissions", description: "Role and access control." },
];

export const permissionModuleIcon: Record<ModuleKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  properties: Building2,
  bookings: CalendarCheck,
  guests: Users,
  modules: Plug,
  cms: PanelsTopLeft,
  blog: Newspaper,
  reports: BarChart3,
  payments: Wallet,
  settings: Settings,
  roles: ShieldCheck,
};

function loadRoles(): AdminRole[] {
  if (typeof window === "undefined") return mockAdminRoles;
  try {
    const raw = window.localStorage.getItem(ROLES_KEY);
    return raw ? (JSON.parse(raw) as AdminRole[]) : mockAdminRoles;
  } catch {
    return mockAdminRoles;
  }
}

function loadUsers(): AdminUserRecord[] {
  if (typeof window === "undefined") return mockAdminUsers;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as AdminUserRecord[]) : mockAdminUsers;
  } catch {
    return mockAdminUsers;
  }
}

export function useRoles() {
  const [roles, setRoles] = useState<AdminRole[]>(mockAdminRoles);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setRoles(loadRoles());
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    }
  }, [roles]);

  const addRole = useCallback((role: AdminRole) => {
    setRoles((prev) => [...prev, role]);
  }, []);

  const updateRole = useCallback((id: string, patch: Partial<AdminRole>) => {
    setRoles((prev) =>
      prev.map((role) => (role.id === id ? { ...role, ...patch } : role))
    );
  }, []);

  const deleteRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== id));
  }, []);

  return { roles, addRole, updateRole, deleteRole };
}

export function useUsers() {
  const [users, setUsers] = useState<AdminUserRecord[]>(mockAdminUsers);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      setUsers(loadUsers());
    }
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users]);

  const setRoleId = useCallback((userId: string, roleId: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, roleId } : user))
    );
  }, []);

  const addUser = useCallback((user: AdminUserRecord) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const updateUser = useCallback(
    (id: string, patch: Partial<AdminUserRecord>) => {
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, ...patch } : user))
      );
    },
    []
  );

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }, []);

  return { users, setRoleId, addUser, updateUser, deleteUser };
}

export function usePermissions() {
  const { users } = useUsers();
  const { roles } = useRoles();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<Permissions>(
    createPermissions(true)
  );

  useEffect(() => {
    const session = getSession();
    const user = users.find((u) => u.email === session?.email);
    const resolved =
      roles.find((r) => r.id === user?.roleId) ??
      roles.find((r) => r.id === "role_super_admin") ??
      null;
    setRole(resolved);
    if (resolved) setPermissions(resolved.permissions);
  }, [users, roles]);

  const can = useCallback(
    (module: ModuleKey, action: PermissionAction = "view") =>
      permissions[module]?.includes(action) ?? false,
    [permissions]
  );

  return { role, permissions, can };
}
