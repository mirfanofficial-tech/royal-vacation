"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Lock,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import {
  useRoles,
  useUsers,
  usePermissions,
  permissionModules,
  permissionModuleIcon,
} from "@/lib/roles";
import {
  ALL_ACTIONS,
  createPermissions,
  type AdminRole,
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
          <label
            key={action}
            className="flex cursor-pointer items-center gap-1.5 text-sm capitalize"
          >
            <Checkbox
              checked={actions.includes(action)}
              disabled={readOnly}
              onCheckedChange={(checked) =>
                onToggleAction(action, checked === true)
              }
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
  role: AdminRole | null;
  isNew: boolean;
  readOnly: boolean;
}) {
  const router = useRouter();
  const { updateRole, addRole } = useRoles();
  const { users, setRoleId } = useUsers();

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(
    role?.status ?? "active"
  );
  const [permissions, setPermissions] = useState<Permissions>(() => {
    if (role) {
      return {
        dashboard: [...role.permissions.dashboard],
        properties: [...role.permissions.properties],
        bookings: [...role.permissions.bookings],
        guests: [...role.permissions.guests],
        modules: [...role.permissions.modules],
        cms: [...role.permissions.cms],
        blog: [...role.permissions.blog],
        reports: [...role.permissions.reports],
        payments: [...role.permissions.payments],
        settings: [...role.permissions.settings],
        roles: [...role.permissions.roles],
      };
    }
    return createPermissions(false);
  });
  const [saved, setSaved] = useState(false);
  const [pendingUserId, setPendingUserId] = useState("");

  const isSuperAdmin = role?.id === "role_super_admin";
  const locked = readOnly || isSuperAdmin;

  const assignedUsers = users.filter((user) => user.roleId === role?.id);
  const availableUsers = users.filter(
    (user) => user.roleId !== role?.id && user.roleId !== ""
  );
  const unassignedUsers = useMemo(
    () => users.filter((user) => user.roleId === ""),
    [users]
  );

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
    setPermissions((prev) => ({
      ...prev,
      [module]: checked ? [...ALL_ACTIONS] : [],
    }));
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

  function handleSave() {
    const id = role?.id ?? `role_${Date.now().toString(36)}`;
    const payload = {
      name: name.trim() || "Untitled role",
      description: description.trim(),
      status,
      permissions,
    };
    if (isNew) {
      addRole({ id, ...payload });
      router.push(`/admin/roles/${id}`);
    } else {
      updateRole(role!.id, payload);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleRemoveUser(userId: string, userName: string) {
    if (window.confirm(`Remove ${userName} from this role?`)) {
      setRoleId(userId, "");
    }
  }

  function handleAddUser() {
    const user = availableUsers.find((u) => u.id === pendingUserId);
    if (!user) return;
    setRoleId(user.id, role!.id);
    setPendingUserId("");
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
              {isNew ? "Create role" : role!.name}
            </h1>
            <Badge variant={status === "active" ? "default" : "outline"}>
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
            {isNew
              ? "Define a new role and the permissions it grants."
              : "Role ID: " + role!.id}
          </p>
        </div>
        {!locked && (
          <Button onClick={handleSave}>
            <Save data-icon="inline-start" />
            {isNew ? "Create role" : "Save Changes"}
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        )}
      </div>

      {isSuperAdmin && (
        <div className="flex items-start gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm">
          <Lock className="mt-0.5 size-4 shrink-0 text-gold" />
          <span>
            Super Admin always has full access to every module and cannot be
            modified.
          </span>
        </div>
      )}

      {!readOnly && !isSuperAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role details</CardTitle>
                <CardDescription>
                  Basic information shown across the admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel} htmlFor="role-name">
                    Role name
                  </label>
                  <Input
                    id="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "inactive")
                    }
                    className={selectClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
                      onToggleAction={(action, checked) =>
                        toggleAction(module.key, action, checked)
                      }
                      onToggleAll={(checked) =>
                        toggleModuleAll(module.key, checked)
                      }
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
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddUser}
                    disabled={!pendingUserId}
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
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 bg-muted/30 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant={user.status === "active" ? "secondary" : "outline"}
                      >
                        {user.status}
                      </Badge>
                      <button
                        type="button"
                        aria-label={`Remove ${user.name}`}
                        onClick={() => handleRemoveUser(user.id, user.name)}
                        className="text-muted-foreground transition-colors outline-none hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {unassignedUsers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unassignedUsers.length} user(s) currently unassigned — assign
                  them to a role to restore access.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {(readOnly || isSuperAdmin) && (
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            {isSuperAdmin
              ? "Super Admin access is fixed and cannot be edited."
              : "You have view-only access to roles. Contact a Super Admin to make changes."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { roles } = useRoles();
  const { can } = usePermissions();
  const isNew = id === "new";

  const role = isNew ? null : roles.find((r) => r.id === id);

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
