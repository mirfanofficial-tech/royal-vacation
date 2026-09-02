"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

import type { AccountStatus } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  permissionModules,
  primaryRole,
  useRolePermissionsQuery,
  useRoles,
  useUsers,
  usePermissions,
} from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/permission-guard";
import { cn } from "@/lib/utils";

const statusBadge: Record<AccountStatus, string> = {
  active: "bg-rating/10 text-rating",
  invited: "bg-amber-600/10 text-amber-600",
  pending: "bg-amber-600/10 text-amber-600",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  deleted: "bg-destructive/10 text-destructive",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function displayName(user: { display_name?: string | null; first_name?: string | null; last_name?: string | null; email: string }) {
  return (
    user.display_name ||
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.email
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function UserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const {
    users,
    isLoading: usersLoading,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    setUserRoles,
    isMutating,
  } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();
  const { can, isSuperAdmin } = usePermissions();

  const user = users.find((u) => u.id === userId);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // `users`/`roles` load asynchronously — seed the form once the real data
  // for this user (and their role list) arrives, not on the first render.
  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setRoleId(primaryRole(user, roles)?.id ?? "");
  }, [user, roles]);

  const { data: rolePermissions } = useRolePermissionsQuery(roleId || undefined);

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
          User not found.
        </CardContent>
      </Card>
    );
  }

  const role = roles.find((r) => r.id === roleId) ?? null;
  const access = permissionModules.filter((m) =>
    rolePermissions?.some((p) => p.resource === m.key && p.action === "view")
  );
  const isSelf = user.email === getSession()?.email;
  const readOnly = !can("roles", "edit");

  async function handleSave() {
    if (!user) return;
    try {
      await updateUser(user.id, {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        display_name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
      });
      if (roleId !== (primaryRole(user, roles)?.id ?? "")) {
        await setUserRoles(user.id, roleId ? [roleId] : []);
      }
      setSaved(true);
      setError("");
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save changes."));
    }
  }

  async function handleToggleStatus() {
    if (!user) return;
    try {
      if (user.status === "active") {
        await suspendUser(user.id);
      } else {
        await activateUser(user.id);
      }
      setError("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this user's status."));
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (
      !window.confirm(
        `Delete user "${displayName(user)}"? This cannot be undone and will revoke all access.`
      )
    )
      return;
    try {
      await deleteUser(user.id);
      router.push("/admin/users/admins");
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this user."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/admin/users/admins" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Users
          </Button>
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
              {initialsOf(displayName(user))}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-navy">{displayName(user)}</h1>
                {isSelf && <Badge variant="secondary">you</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{role?.display_name ?? "Unassigned"}</Badge>
            <Badge className={cn("rounded-full capitalize", statusBadge[user.status])}>
              {user.status}
            </Badge>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <UserMinus className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Contact details for this team member.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel} htmlFor="user-first-name">
                  First name
                </label>
                <Input
                  id="user-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="user-last-name">
                  Last name
                </label>
                <Input
                  id="user-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={fieldLabel} htmlFor="user-email">
                  Email
                </label>
                <Input id="user-email" type="email" value={user.email} disabled />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email can&apos;t be changed after the account is created.
                </p>
              </div>
              {!readOnly && (
                <div className="flex justify-end sm:col-span-2">
                  <Button onClick={handleSave} size="sm" disabled={isMutating}>
                    {isMutating ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <Save data-icon="inline-start" />
                    )}
                    Save changes
                    {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-muted-foreground" />
                Role & Access
              </CardTitle>
              <CardDescription>
                The role defines which modules this user can view and act on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={fieldLabel} htmlFor="user-role">
                  Role
                </label>
                <select
                  id="user-role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  disabled={readOnly}
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.display_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {role?.description ?? "Assign a role to grant access."}
                </p>
              </div>

              <div>
                <span className={fieldLabel}>Module access</span>
                <div className="flex flex-wrap gap-1.5">
                  {access.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No modules granted — assign a role to restore access.
                    </span>
                  )}
                  {access.map((m) => (
                    <Badge key={m.key} variant="secondary">
                      {m.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Account status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Last active</p>
                <p className="mt-0.5 text-sm font-medium">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : "Never signed in"}
                </p>
              </div>
              {!readOnly && !isSelf && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleToggleStatus}
                  disabled={isMutating}
                >
                  <UserCheck data-icon="inline-start" />
                  {user.status === "active" ? "Suspend account" : "Activate account"}
                </Button>
              )}
            </CardContent>
          </Card>

          {isSuperAdmin && !isSelf && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <UserMinus className="size-4 text-muted-foreground" />
                  Danger zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={isMutating}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete permanently
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <PermissionGuard module="roles">
      <UserDetail key={id} userId={id} />
    </PermissionGuard>
  );
}
