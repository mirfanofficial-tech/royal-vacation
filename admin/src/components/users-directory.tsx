"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import type { AccountStatus, UserOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { primaryRole, useRoles, useUsers, usePermissions } from "@/lib/roles";
import type { UserSegment } from "@/lib/user-segments";
import { cn } from "@/lib/utils";
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

function displayName(user: UserOut) {
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

function formatLastActive(value: string | null | undefined) {
  if (!value) return "Never signed in";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateTempPassword() {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "").slice(0, 12);
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export function UsersDirectory({ segment }: { segment: UserSegment }) {
  const {
    users: allUsers,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser,
    setUserRoles,
    isMutating,
  } = useUsers(segment.accountType);
  const { roles } = useRoles();
  const { can, isSuperAdmin } = usePermissions();

  // Narrow the account_type result to the segment's roles, when it defines any.
  const users = useMemo(() => {
    if (!segment.roleNames) return allUsers;
    const wanted = new Set(segment.roleNames);
    return allUsers.filter((user) => user.roles.some((r) => wanted.has(r)));
  }, [allUsers, segment.roleNames]);

  const addRoleOptions = useMemo(() => {
    const active = roles.filter((role) => role.status === "active");
    if (!segment.addRoleNames) return active;
    const wanted = new Set(segment.addRoleNames);
    return active.filter((role) => wanted.has(role.name));
  }, [roles, segment.addRoleNames]);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<UserOut | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const currentEmail = getSession()?.email;

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const matchesQuery = `${displayName(user)} ${user.email}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesRole =
          roleFilter === "all" || primaryRole(user, roles)?.id === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesQuery && matchesRole && matchesStatus;
      }),
    [users, roles, query, roleFilter, statusFilter]
  );

  const active = users.filter((u) => u.status === "active").length;
  const invited = users.filter((u) => u.status === "invited" || u.status === "pending").length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  const stats = [
    { label: `Total ${segment.title.toLowerCase()}`, value: users.length, icon: Users },
    { label: "Active", value: active, icon: UserCheck },
    { label: "Invited", value: invited, icon: UserPlus },
    { label: "Suspended", value: suspended, icon: UserMinus },
  ];

  function flash(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 6000);
  }

  function flashError(message: string) {
    setError(message);
    setNotice("");
  }

  function openAdd() {
    setEditing(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setTempPassword(generateTempPassword());
    setRoleId(addRoleOptions[0]?.id ?? "");
    setSheetOpen(true);
  }

  function openEdit(user: UserOut) {
    setEditing(user);
    setFirstName(user.first_name ?? "");
    setLastName(user.last_name ?? "");
    setEmail(user.email);
    setTempPassword("");
    setRoleId(primaryRole(user, roles)?.id ?? "");
    setSheetOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateUser(editing.id, {
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          display_name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        });
        if (roleId && roleId !== primaryRole(editing, roles)?.id) {
          await setUserRoles(editing.id, [roleId]);
        }
        flash(`Changes saved for ${displayName(editing)}.`);
      } else {
        const created = await createUser({
          email: email.trim(),
          password: tempPassword,
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          display_name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
          account_type: segment.accountType,
          status: "invited",
          role_ids: roleId ? [roleId] : [],
        });
        flash(
          `${displayName(created)} was created. Temporary password: "${tempPassword}" — ` +
            "share it with them directly, there's no email delivery configured yet."
        );
      }
      setSheetOpen(false);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't save this user. Please try again."));
    }
  }

  async function handleDelete(user: UserOut) {
    if (!window.confirm(`Delete user "${displayName(user)}"? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      flash(`User ${displayName(user)} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this user."));
    }
  }

  async function handleToggleStatus(user: UserOut) {
    try {
      if (user.status === "active") {
        await suspendUser(user.id);
        flash(`${displayName(user)} is now suspended.`);
      } else {
        await activateUser(user.id);
        flash(`${displayName(user)} is now active.`);
      }
    } catch (err) {
      flashError(errorMessage(err, "Couldn't update this user's status."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">{segment.title}</h1>
          <p className="text-sm text-muted-foreground">{segment.description}</p>
        </div>
        {can("roles", "create") && addRoleOptions.length > 0 && (
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            Add {segment.title.toLowerCase().replace(/s$/, "")}
          </Button>
        )}
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm break-words text-emerald-800">
          <UserCheck className="size-4 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <UserMinus className="size-4 shrink-0" />
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

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>All {segment.title.toLowerCase()}</CardTitle>
              <CardDescription>
                {filtered.length} of {users.length} shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  aria-label="Search users"
                  className="h-8 w-56 pl-8"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | AccountStatus)}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((user) => {
                    const isSelf = user.email === currentEmail;
                    const role = primaryRole(user, roles);
                    const name = displayName(user);
                    return (
                      <tr key={user.id} className="hover:bg-muted/40">
                        <td className="max-w-md px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                              {initialsOf(name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {name}
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
                          <Badge variant="secondary">
                            {role?.display_name ?? "Unassigned"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge className={cn("rounded-full capitalize", statusBadge[user.status])}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {formatLastActive(user.last_login_at)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label="User actions"
                              disabled={isMutating}
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
                              {can("roles", "edit") && !isSelf && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                  <UserMinus />
                                  {user.status === "active" ? "Suspend" : "Activate"}
                                </DropdownMenuItem>
                              )}
                              {isSuperAdmin && !isSelf && (
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
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      {users.length === 0 && segment.emptyHint
                        ? segment.emptyHint
                        : "No users match your filters."}
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
            <SheetTitle>
              {editing ? "Edit user" : `Add ${segment.title.toLowerCase().replace(/s$/, "")}`}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? "Update the user's profile and role."
                : `Create a new ${segment.title.toLowerCase().replace(/s$/, "")} account.`}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={fieldLabel} htmlFor="user-first-name">
                  First name
                </label>
                <Input
                  id="user-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
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
                  placeholder="Morgan"
                />
              </div>
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
                disabled={Boolean(editing)}
              />
              {editing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Email can&apos;t be changed after the account is created.
                </p>
              )}
            </div>
            {!editing && (
              <div>
                <label className={fieldLabel} htmlFor="user-temp-password">
                  Temporary password
                </label>
                <div className="flex gap-2">
                  <Input
                    id="user-temp-password"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Regenerate password"
                    onClick={() => setTempPassword(generateTempPassword())}
                  >
                    <RefreshCw />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  There&apos;s no email delivery configured yet — share this with the
                  user directly so they can sign in.
                </p>
              </div>
            )}
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
                <option value="">Unassigned</option>
                {addRoleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
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
              disabled={!email.trim() || (!editing && !tempPassword) || isMutating}
            >
              {isMutating ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Mail data-icon="inline-start" />
              )}
              {editing ? "Save changes" : "Create user"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
