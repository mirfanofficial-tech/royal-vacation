"use client";

import { useCallback, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
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

import type {
  RoleCreate,
  RoleOut,
  RolePermissionsUpdate,
  RoleUpdate,
  UserCreate,
  UserOut,
  UserUpdate,
} from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import {
  createPermissions,
  type ModuleKey,
  type PermissionAction,
  type Permissions,
} from "@/lib/mock-data";

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

const ROLES_KEY = ["admin", "roles"] as const;
const ADMIN_USERS_KEY = ["admin", "users"] as const;
const ME_KEY = ["auth", "me"] as const;

// ---- Roles -----------------------------------------------------------------

export function useRolesQuery() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => callApi(() => api.admin.roles.list()),
  });
}

function mutateAsyncFn<TVars, TData>(mutation: UseMutationResult<TData, unknown, TVars>) {
  return mutation.mutateAsync;
}

export function useRoles() {
  const query = useRolesQuery();
  const qc = useQueryClient();

  const createRole = useMutation({
    mutationFn: (body: RoleCreate) => callApi(() => api.admin.roles.create(body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
  const updateRole = useMutation({
    mutationFn: ({ id, body }: { id: string; body: RoleUpdate }) =>
      callApi(() => api.admin.roles.update(id, body)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
  const deleteRole = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.roles.remove(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });

  return {
    roles: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createRole: mutateAsyncFn(createRole),
    updateRole: (id: string, body: RoleUpdate) => updateRole.mutateAsync({ id, body }),
    deleteRole: mutateAsyncFn(deleteRole),
    isMutating: createRole.isPending || updateRole.isPending || deleteRole.isPending,
  };
}

export function useRolePermissionsQuery(roleId: string | undefined) {
  return useQuery({
    queryKey: [...ROLES_KEY, roleId, "permissions"],
    queryFn: () => callApi(() => api.admin.roles.permissions(roleId!)),
    enabled: Boolean(roleId),
  });
}

export function useSetRolePermissions(roleId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RolePermissionsUpdate) =>
      callApi(() => api.admin.roles.setPermissions(roleId!, body)),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: [...ROLES_KEY, roleId, "permissions"] }),
  });
}

// ---- Admin (staff) users -----------------------------------------------

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: () =>
      callApi(() => api.admin.users.list({ account_type: "admin", limit: 200 })),
  });
}

export function useUsers() {
  const query = useAdminUsersQuery();
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    qc.invalidateQueries({ queryKey: ME_KEY });
  };

  const createUser = useMutation({
    mutationFn: (body: UserCreate) => callApi(() => api.admin.users.create(body)),
    onSuccess: invalidate,
  });
  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserUpdate }) =>
      callApi(() => api.admin.users.update(id, body)),
    onSuccess: invalidate,
  });
  const deleteUser = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.users.remove(id)),
    onSuccess: invalidate,
  });
  const suspendUser = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.users.suspend(id)),
    onSuccess: invalidate,
  });
  const activateUser = useMutation({
    mutationFn: (id: string) => callApi(() => api.admin.users.activate(id)),
    onSuccess: invalidate,
  });
  const setUserRoles = useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      callApi(() => api.admin.users.setRoles(id, { role_ids: roleIds })),
    onSuccess: invalidate,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createUser: mutateAsyncFn(createUser),
    updateUser: (id: string, body: UserUpdate) => updateUser.mutateAsync({ id, body }),
    deleteUser: mutateAsyncFn(deleteUser),
    suspendUser: mutateAsyncFn(suspendUser),
    activateUser: mutateAsyncFn(activateUser),
    setUserRoles: (id: string, roleIds: string[]) =>
      setUserRoles.mutateAsync({ id, roleIds }),
    isMutating:
      createUser.isPending ||
      updateUser.isPending ||
      deleteUser.isPending ||
      suspendUser.isPending ||
      activateUser.isPending ||
      setUserRoles.isPending,
  };
}

/** Resolves a staff user's single admin-panel role to a RoleOut for display. */
export function primaryRole(user: Pick<UserOut, "roles">, roles: RoleOut[]): RoleOut | null {
  return roles.find((r) => user.roles.includes(r.name)) ?? null;
}

// ---- Current-user permissions (UI-only gate — see DATABASE.md Phase 7) ----

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => callApi(() => api.auth.me()),
    enabled: isAuthenticated(),
    staleTime: 60_000,
  });
}

export function usePermissions() {
  const { data: me, isLoading: meLoading } = useCurrentUserQuery();
  const { roles, isLoading: rolesLoading } = useRoles();

  const isSuperAdmin = me?.roles.includes("super_admin") ?? false;
  const role = useMemo(() => (me ? primaryRole(me, roles) : null), [me, roles]);

  const { data: rolePermissions, isLoading: permissionsLoading } = useRolePermissionsQuery(
    !isSuperAdmin ? role?.id : undefined
  );

  const permissions: Permissions = useMemo(() => {
    if (isSuperAdmin) return createPermissions(true);
    if (!rolePermissions) return createPermissions(false);
    const next = createPermissions(false);
    for (const perm of rolePermissions) {
      const moduleKey = perm.resource as ModuleKey;
      if (!next[moduleKey].includes(perm.action as PermissionAction)) {
        next[moduleKey] = [...next[moduleKey], perm.action as PermissionAction];
      }
    }
    return next;
  }, [isSuperAdmin, rolePermissions]);

  const can = useCallback(
    (module: ModuleKey, action: PermissionAction = "view") =>
      me?.account_type === "admin" && (permissions[module]?.includes(action) ?? false),
    [me, permissions]
  );

  return {
    me: me ?? null,
    role: isSuperAdmin ? { name: "Super Admin" } : role,
    isSuperAdmin,
    permissions,
    can,
    isLoading: meLoading || rolesLoading || (Boolean(role) && permissionsLoading),
  };
}
