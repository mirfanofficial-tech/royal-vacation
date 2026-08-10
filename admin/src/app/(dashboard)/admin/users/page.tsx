"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import { useUsers, useRoles, usePermissions } from "@/lib/roles";
import { getSession } from "@/lib/auth";
import type { AdminUserStatus, AdminUserRecord } from "@/lib/mock-data";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { roles } = useRoles();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all");
  const [notice, setNotice] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const currentEmail = getSession()?.email;

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery = `${user.name} ${user.email}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesRole = roleFilter === "all" || user.roleId === roleFilter;
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;
        return matchesQuery && matchesRole && matchesStatus;
      }),
    [users, query, roleFilter, statusFilter]
  );

  const active = users.filter((u) => u.status === "active").length;
  const invited = users.filter((u) => u.status === "invited").length;
  const inactive = users.filter((u) => u.status === "inactive").length;

  const stats = [
    { label: "Total users", value: users.length, icon: Users },
    { label: "Active", value: active, icon: UserCheck },
    { label: "Invited", value: invited, icon: UserPlus },
    { label: "Inactive", value: inactive, icon: UserMinus },
  ];

  function roleName(id: string) {
    return roles.find((r) => r.id === id)?.name ?? "Unassigned";
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function openInvite() {
    setEditing(null);
    setName("");
    setEmail("");
    setRoleId(roles[0]?.id ?? "");
    setSheetOpen(true);
  }

  function openEdit(user: AdminUserRecord) {
    setEditing(user);
    setName(user.name);
    setEmail(user.email);
    setRoleId(user.roleId);
    setSheetOpen(true);
  }

  function handleSave() {
    if (editing) {
      updateUser(editing.id, {
        name: name.trim() || editing.name,
        email: email.trim() || editing.email,
        roleId,
      });
      flash(`Changes saved for ${editing.name}.`);
    } else {
      const newUser: AdminUserRecord = {
        id: `user_${Date.now().toString(36)}`,
        name: name.trim() || "New user",
        email: email.trim(),
        roleId,
        status: "invited",
        lastActive: "—",
      };
      addUser(newUser);
      flash(`Invitation sent to ${newUser.email}.`);
    }
    setSheetOpen(false);
  }

  function handleDelete(user: AdminUserRecord) {
    if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
      deleteUser(user.id);
      flash(`User ${user.name} deleted.`);
    }
  }

  function handleToggleStatus(user: AdminUserRecord) {
    const next = user.status === "active" ? "inactive" : "active";
    updateUser(user.id, { status: next });
    flash(`${user.name} is now ${next}.`);
  }

  function handleResend(user: AdminUserRecord) {
    flash(`Invitation re-sent to ${user.email}.`);
  }

  return (
    <PermissionGuard module="roles">
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">Users</h1>
            <p className="text-sm text-muted-foreground">
              Invite team members, assign roles and manage account access.
            </p>
          </div>
          {can("roles", "create") && (
            <Button onClick={openInvite}>
              <Plus data-icon="inline-start" />
              Invite user
            </Button>
          )}
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <UserCheck className="size-4 shrink-0" />
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All users</CardTitle>
            <CardDescription>
              {filtered.length} of {users.length} users shown.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users…"
                  className="pl-8"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={selectClass}
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | AdminUserStatus)
                }
                className={selectClass}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Last active</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((user) => {
                    const isSelf = user.email === currentEmail;
                    return (
                      <tr key={user.id} className="hover:bg-muted/40">
                        <td className="max-w-md px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                              {initialsOf(user.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {user.name}
                                {isSelf && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (you)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="secondary">{roleName(user.roleId)}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariant[user.status]}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {user.lastActive}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label="User actions"
                              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" alignOffset={-8}>
                              {can("roles", "edit") && (
                                <DropdownMenuItem onClick={() => openEdit(user)}>
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {user.status === "invited" && (
                                <DropdownMenuItem onClick={() => handleResend(user)}>
                                  <Send />
                                  Resend invite
                                </DropdownMenuItem>
                              )}
                              {can("roles", "edit") && !isSelf && (
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  <UserMinus />
                                  {user.status === "active" ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              )}
                              {can("roles", "delete") && !isSelf && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDelete(user)}
                                  >
                                    <Trash2 />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-sm text-muted-foreground"
                      >
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editing ? "Edit user" : "Invite user"}</SheetTitle>
              <SheetDescription>
                {editing
                  ? "Update the user's profile and role."
                  : "Send an invitation to join the admin panel."}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-4">
              <div>
                <label className={fieldLabel} htmlFor="user-name">
                  Full name
                </label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
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
                  placeholder="alex@royalvacation.com"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="user-role">
                  Role
                </label>
                <select
                  id="user-role"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className={selectClass}
                >
                  {roles
                    .filter((role) => role.status === "active")
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  The role defines which modules this user can access.
                </p>
              </div>
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!email.trim() || !roleId}
              >
                <Mail data-icon="inline-start" />
                {editing ? "Save changes" : "Send invite"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </PermissionGuard>
  );
}
