"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  Lock,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import type { RoleOut } from "@royal-vacation/api-client";
import { api, ApiError, callApi } from "@/lib/api";
import {
  permissionModules,
  permissionModuleIcon,
  useRolePermissionsQuery,
  useRoles,
  useSetRolePermissions,
  useUsers,
  usePermissions,
} from "@/lib/roles";
import {
  ALL_ACTIONS,
  createPermissions,
  type ModuleKey,
  type PermissionAction,
  type Permissions,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/permission-guard";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function toPermissionInputs(permissions: Permissions) {
  return (Object.keys(permissions) as ModuleKey[]).flatMap((module) =>
    permissions[module].map((action) => ({ module, action }))
  );
}

function ModulePermissionCard({
  module,
  actions,
  readOnly,
  onToggleAction,
  onToggleAll,
}: {
  module: (typeof permissionModules)[number];
  actions: PermissionAction[];
  readOnly: boolean;
  onToggleAction: (action: PermissionAction, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  const Icon = permissionModuleIcon[module.key];
  const all = ALL_ACTIONS.every((action) => actions.includes(action));

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            {module.label}
          </span>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
            All
            <Checkbox
              checked={all}
              disabled={readOnly}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
            />
          </label>
        </CardTitle>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {ALL_ACTIONS.map((action) => (
          <label key={action} className="flex cursor-pointer items-center gap-1.5 text-sm capitalize">
            <Checkbox
              checked={actions.includes(action)}
              disabled={readOnly}
              onCheckedChange={(checked) => onToggleAction(action, checked === true)}
            />
            {action}
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

function RoleEditor({
  role,
  isNew,
  readOnly,
}: {
  role: RoleOut | null;
  isNew: boolean;
  readOnly: boolean;
}) {
  const router = useRouter();
  const { updateRole, createRole, refetch: refetchRoles } = useRoles();
  const { users, setUserRoles, isMutating: usersMutating } = useUsers();
  const { data: loadedPermissions, isLoading: permissionsLoading } = useRolePermissionsQuery(
    role?.id
  );
  const setRolePermissions = useSetRolePermissions(role?.id);

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [permissions, setPermissions] = useState<Permissions>(createPermissions(false));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");

  // `role` arrives asynchronously (react-query) — seed the form once it
  // loads rather than at first render, when it's still null.
  useEffect(() => {
    if (!role) return;
    setName(role.name);
    setDisplayName(role.display_name);
    setDescription(role.description ?? "");
    setLevel(role.level);
    setStatus(role.status);
  }, [role]);

  useEffect(() => {
    if (!loadedPermissions) return;
    const next = createPermissions(false);
    for (const perm of loadedPermissions) {
      const moduleKey = perm.resource as ModuleKey;
      next[moduleKey] = [...next[moduleKey], perm.action as PermissionAction];
    }
    setPermissions(next);
  }, [loadedPermissions]);

  const isSuperAdmin = role?.name === "super_admin";
  const locked = readOnly || isSuperAdmin;

  const assignedUsers = role ? users.filter((u) => u.roles.includes(role.name)) : [];
  const availableUsers = role ? users.filter((u) => !u.roles.includes(role.name)) : [];
  const unassignedUsers = useMemo(() => users.filter((u) => u.roles.length === 0), [users]);

  function toggleAction(module: ModuleKey, action: PermissionAction, checked: boolean) {
    setPermissions((prev) => {
      const current = prev[module];
      return {
        ...prev,
        [module]: checked
          ? [...new Set([...current, action])]
          : current.filter((a) => a !== action),
      };
    });
  }

  function toggleModuleAll(module: ModuleKey, checked: boolean) {
    setPermissions((prev) => ({ ...prev, [module]: checked ? [...ALL_ACTIONS] : [] }));
  }

  function setAll(checked: boolean) {
    setPermissions((prev) => {
      const next = { ...prev };
      (Object.keys(next) as ModuleKey[]).forEach((key) => {
        next[key] = checked ? [...ALL_ACTIONS] : [];
      });
      return next;
    });
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      if (isNew) {
        const created = await createRole({
          name: name.trim(),
          display_name: displayName.trim() || name.trim(),
          description: description.trim() || undefined,
          level,
          status,
        });
        await callApi(() =>
          api.admin.roles.setPermissions(created.id, {
            permissions: toPermissionInputs(permissions),
          })
        );
        router.push(`/admin/roles/${created.id}`);
      } else if (role) {
        await updateRole(role.id, {
          display_name: displayName.trim() || role.display_name,
          description: description.trim(),
          level,
          status,
        });
        await setRolePermissions.mutateAsync({ permissions: toPermissionInputs(permissions) });
        await refetchRoles();
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save this role.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveUser(userId: string, userLabel: string) {
    if (!window.confirm(`Remove ${userLabel} from this role?`)) return;
    try {
      await setUserRoles(userId, []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove this user.");
    }
  }

  async function handleAddUser() {
    if (!role) return;
    const user = availableUsers.find((u) => u.id === pendingUserId);
    if (!user) return;
    try {
      await setUserRoles(user.id, [role.id]);
      setPendingUserId("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't assign this user.");
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
            render={<Link href="/admin/roles" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Roles
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-navy">
              {isNew ? "Create role" : role!.display_name}
            </h1>
            <Badge
              className={cn(
                "rounded-full",
                status === "active" ? "bg-rating/10 text-rating" : "bg-muted text-muted-foreground"
              )}
            >
              {status === "active" ? "Active" : "Inactive"}
            </Badge>
            {isSuperAdmin && (
              <Badge variant="secondary">
                <Lock data-icon="inline-start" className="size-3" />
                System role
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isNew ? "Define a new role and the permissions it grants." : "Role ID: " + role!.id}
          </p>
        </div>
        {!locked && (
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {isNew ? "Create role" : "Save Changes"}
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      {isSuperAdmin && (
        <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
          <span>Super Admin always has full access to every module and cannot be modified.</span>
        </div>
      )}

      {!readOnly && !isSuperAdmin && (permissionsLoading && !isNew ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role details</CardTitle>
                <CardDescription>Basic information shown across the admin panel.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel} htmlFor="role-slug">
                    Internal name
                  </label>
                  <Input
                    id="role-slug"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. operations_manager"
                    disabled={!isNew}
                  />
                  {!isNew && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      The internal name can&apos;t be changed after creation.
                    </p>
                  )}
                </div>
                <div>
                  <label className={fieldLabel} htmlFor="role-display-name">
                    Display name
                  </label>
                  <Input
                    id="role-display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Operations Manager"
                  />
                </div>
                <div>
                  <label className={fieldLabel} htmlFor="role-status">
                    Status
                  </label>
                  <select
                    id="role-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                    className={selectClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel} htmlFor="role-level">
                    Level
                  </label>
                  <Input
                    id="role-level"
                    type="number"
                    min={0}
                    value={level}
                    onChange={(e) => setLevel(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Higher number = higher-ranked role (informational only).
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className={fieldLabel} htmlFor="role-description">
                    Description
                  </label>
                  <Input
                    id="role-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What can this role do?"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  Permissions
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(true)}>
                      Select all
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(false)}>
                      Clear all
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Grant or restrict access to each module and its actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {permissionModules.map((module) => (
                    <ModulePermissionCard
                      key={module.key}
                      module={module}
                      actions={permissions[module.key]}
                      readOnly={false}
                      onToggleAction={(action, checked) => toggleAction(module.key, action, checked)}
                      onToggleAll={(checked) => toggleModuleAll(module.key, checked)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-muted-foreground" />
                Assigned users
              </CardTitle>
              <CardDescription>
                {role
                  ? `${assignedUsers.length} user(s) with this role.`
                  : "New roles start with no members."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {role && (
                <div className="flex gap-2">
                  <select
                    value={pendingUserId}
                    onChange={(e) => setPendingUserId(e.target.value)}
                    className={cn(selectClass, "flex-1")}
                    aria-label="Add user"
                  >
                    <option value="">Select a user…</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name || user.email}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUser}
                    disabled={!pendingUserId || usersMutating}
                  >
                    <UserPlus data-icon="inline-start" />
                    Add
                  </Button>
                </div>
              )}

              <div className="divide-y divide-border rounded-lg border border-border">
                {assignedUsers.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No users assigned yet.
                  </p>
                )}
                {assignedUsers.map((user) => {
                  const label = user.display_name || user.email;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 bg-muted/30 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{label}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge
                          className={cn(
                            "rounded-full capitalize",
                            user.status === "active"
                              ? "bg-rating/10 text-rating"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {user.status}
                        </Badge>
                        <button
                          type="button"
                          aria-label={`Remove ${label}`}
                          onClick={() => handleRemoveUser(user.id, label)}
                          className="text-muted-foreground transition-colors outline-none hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {unassignedUsers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unassignedUsers.length} user(s) currently unassigned — assign them to a role to
                  restore access.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ))}

      {(readOnly || isSuperAdmin) && (
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Super Admin access is fixed and cannot be edited."
              : "You have view-only access to roles. Contact a Super Admin if you need access."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { roles, isLoading } = useRoles();
  const { can } = usePermissions();
  const isNew = id === "new";

  const role = isNew ? null : roles.find((r) => r.id === id);

  if (!isNew && isLoading) {
    return (
      <PermissionGuard module="roles">
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </PermissionGuard>
    );
  }

  if (!isNew && !role) {
    return (
      <PermissionGuard module="roles">
        <div className="space-y-6 p-6 lg:p-8">
          <Card>
            <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
              Role not found.
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard module="roles">
      <RoleEditor
        key={isNew ? "new" : id}
        role={role ?? null}
        isNew={isNew}
        readOnly={!can("roles", "edit")}
      />
    </PermissionGuard>
  );
}
