"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Mail,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

import { useUsers, useRoles, usePermissions, permissionModules } from "@/lib/roles";
import { getSession } from "@/lib/auth";
import type { AdminUserStatus } from "@/lib/mock-data";
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

const statusVariant: Record<AdminUserStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  invited: "outline",
  inactive: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const { users, updateUser, deleteUser } = useUsers();
  const { roles } = useRoles();
  const { can } = usePermissions();

  const user = users.find((u) => u.id === userId);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [resent, setResent] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
          User not found.
        </CardContent>
      </Card>
    );
  }

  const currentUser = user;

  const role = roles.find((r) => r.id === currentUser.roleId);
  const access = role
    ? permissionModules.filter((m) => role.permissions[m.key].includes("view"))
    : [];
  const isSelf = currentUser.email === getSession()?.email;
  const readOnly = !can("roles", "edit");

  function handleSave() {
    updateUser(currentUser.id, {
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleStatusChange(status: AdminUserStatus) {
    updateUser(currentUser.id, { status });
  }

  function handleDelete() {
    if (
      window.confirm(
        `Delete user "${currentUser.name}"? This cannot be undone and will revoke all access.`
      )
    ) {
      deleteUser(currentUser.id);
      router.push("/admin/users");
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
            render={<Link href="/admin/users" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Users
          </Button>
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy/10 text-sm font-semibold text-navy">
              {initialsOf(currentUser.name)}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-navy">
                  {currentUser.name}
                </h1>
                {isSelf && <Badge variant="secondary">you</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{role?.name ?? "Unassigned"}</Badge>
            <Badge variant={statusVariant[currentUser.status]}>{currentUser.status}</Badge>
            {currentUser.status === "invited" && (
              <Badge variant="outline">
                <Mail data-icon="inline-start" className="size-3" />
                Invite pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>
                Contact details for this team member.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel} htmlFor="user-name">
                  Full name
                </label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="user-email">
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={readOnly}
                />
              </div>
              {!readOnly && (
                <div className="flex justify-end sm:col-span-2">
                  <Button onClick={handleSave} size="sm">
                    <Save data-icon="inline-start" />
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
                  value={currentUser.roleId}
                  onChange={(e) => updateUser(currentUser.id, { roleId: e.target.value })}
                  disabled={readOnly}
                  className={selectClass}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
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
              <div>
                <label className={fieldLabel} htmlFor="user-status">
                  Status
                </label>
                <select
                  id="user-status"
                  value={currentUser.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as AdminUserStatus)
                  }
                  disabled={readOnly || isSelf}
                  className={selectClass}
                >
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="inactive">Inactive</option>
                </select>
                {isSelf && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    You can&apos;t change your own status.
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Last active</p>
                <p className="mt-0.5 text-sm font-medium">
                  {currentUser.lastActive === "—" ? "Never signed in" : currentUser.lastActive}
                </p>
              </div>
              {currentUser.status === "invited" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setResent(true);
                    window.setTimeout(() => setResent(false), 3000);
                  }}
                >
                  {resent ? (
                    <>
                      <CheckCircle2 data-icon="inline-start" className="text-emerald-600" />
                      Invitation re-sent
                    </>
                  ) : (
                    <>
                      <Send data-icon="inline-start" />
                      Resend invitation
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {!readOnly && !isSelf && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <UserMinus className="size-4 text-muted-foreground" />
                  Danger zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    handleStatusChange(
                      currentUser.status === "active" ? "inactive" : "active"
                    )
                  }
                >
                  <UserCheck data-icon="inline-start" />
                  {currentUser.status === "active"
                    ? "Deactivate account"
                    : "Activate account"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleDelete}
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
