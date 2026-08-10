"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Shield,
  Lock,
} from "lucide-react";

import type { RoleOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import {
  permissionModules,
  useRolePermissionsQuery,
  useRoles,
  useUsers,
  usePermissions,
} from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusBadge = {
  active: "bg-rating/10 text-rating",
  inactive: "bg-muted text-muted-foreground",
} as const;

function RoleCard({
  role,
  userCount,
  canDelete,
  onDelete,
}: {
  role: RoleOut;
  userCount: number;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const { data: permissions, isLoading } = useRolePermissionsQuery(role.id);
  const access = permissionModules.filter((module) =>
    permissions?.some((p) => p.resource === module.key && p.action === "view")
  );
  const extra = access.length - 5;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{role.display_name}</p>
                <Badge className={cn("rounded-full", statusBadge[role.status])}>
                  {role.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {userCount} user{userCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`${role.display_name} actions`}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" alignOffset={-8}>
              <DropdownMenuItem render={<Link href={`/admin/roles/${role.id}`} />}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={role.is_system}
                    onClick={onDelete}
                  >
                    {role.is_system ? <Lock /> : <Trash2 />}
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground">{role.description}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {isLoading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          {!isLoading &&
            access.slice(0, 5).map((module) => (
              <Badge key={module.key} variant="secondary">
                {module.label}
              </Badge>
            ))}
          {!isLoading && extra > 0 && (
            <span className="text-xs text-muted-foreground">+{extra} more</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" size="sm" render={<Link href={`/admin/roles/${role.id}`} />}>
            <ShieldCheck data-icon="inline-start" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RolesPage() {
  const { roles, isLoading, deleteRole } = useRoles();
  const { users } = useUsers();
  const { can } = usePermissions();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      roles.filter(
        (role) =>
          role.display_name.toLowerCase().includes(query.toLowerCase()) ||
          (role.description ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [roles, query]
  );

  const activeRoles = roles.filter((role) => role.status === "active").length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const invitedUsers = users.filter(
    (user) => user.status === "invited" || user.status === "pending"
  ).length;

  const stats = [
    { label: "Total roles", value: roles.length, icon: ShieldCheck },
    { label: "Active roles", value: activeRoles, icon: Shield },
    { label: "Active users", value: activeUsers, icon: UserCheck },
    { label: "Invited users", value: invitedUsers, icon: UserPlus },
  ];

  async function handleDelete(role: RoleOut) {
    if (
      !window.confirm(
        `Delete the role "${role.display_name}"? Users assigned to it will lose access.`
      )
    )
      return;
    try {
      await deleteRole(role.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this role.");
    }
  }

  return (
    <PermissionGuard module="roles">
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">Roles & Permissions</h1>
            <p className="text-sm text-muted-foreground">
              Control what each team member can view and do across modules.
            </p>
          </div>
          {can("roles", "create") && (
            <Button render={<Link href="/admin/roles/new" />}>
              <Plus data-icon="inline-start" />
              Create role
            </Button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles…"
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                userCount={users.filter((u) => u.roles.includes(role.name)).length}
                canDelete={can("roles", "delete")}
                onDelete={() => handleDelete(role)}
              />
            ))}
            {filtered.length === 0 && (
              <Card className="lg:col-span-2 xl:col-span-3">
                <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
                  No roles match your search.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
