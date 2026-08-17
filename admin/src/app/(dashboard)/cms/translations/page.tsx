"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  CheckCircle2,
  FileText,
  Languages,
  Loader2,
  MoreHorizontal,
  Newspaper,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

import type { TranslationTaskOut, TranslationTaskStatus } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useTranslationTasks } from "@/lib/translations";
import { useLanguages } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "requested", label: "Requested" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type StatusTab = (typeof statusTabs)[number]["value"];

const statusBadgeClass: Record<TranslationTaskStatus, string> = {
  requested: "bg-gold/15 text-gold",
  done: "bg-rating/10 text-rating",
  cancelled: "bg-muted text-muted-foreground",
};

const entityMeta: Record<string, { label: string; icon: typeof FileText; className: string }> = {
  cms_page: { label: "Page", icon: FileText, className: "bg-navy/10 text-navy" },
  blog_post: { label: "Post", icon: Newspaper, className: "bg-gold/10 text-gold" },
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function entityEditHref(task: TranslationTaskOut) {
  if (task.entity_type === "blog_post") return `/blogs/${task.entity_id}/editor`;
  return `/cms/pages/${task.entity_id}/builder`;
}

function TranslationTasks() {
  const { tasks, isLoading, error: queryError, updateTask, deleteTask, isMutating } = useTranslationTasks();
  const { languages } = useLanguages();
  const { can } = usePermissions();
  const [tab, setTab] = useState<StatusTab>("all");
  const [error, setError] = useState("");

  const statusCounts = useMemo(
    () => ({
      all: tasks.length,
      requested: tasks.filter((t) => t.status === "requested").length,
      done: tasks.filter((t) => t.status === "done").length,
      cancelled: tasks.filter((t) => t.status === "cancelled").length,
    }),
    [tasks]
  );

  const filtered = useMemo(
    () => (tab === "all" ? tasks : tasks.filter((t) => t.status === tab)),
    [tasks, tab]
  );

  function languageLabel(code: string) {
    return languages.find((l) => l.code === code)?.native_name ?? code.toUpperCase();
  }

  async function handleUpdate(task: TranslationTaskOut, status: TranslationTaskStatus) {
    try {
      await updateTask(task.id, { status });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this request."));
    }
  }

  async function handleDelete(task: TranslationTaskOut) {
    if (
      !window.confirm(
        `Delete the translation request for "${task.entity_title ?? "this item"}" into ${languageLabel(task.target_language_code)}?`
      )
    ) {
      return;
    }
    try {
      await deleteTask(task.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this request."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Translation requests</h1>
        <p className="text-sm text-muted-foreground">
          {statusCounts.requested} open request{statusCounts.requested === 1 ? "" : "s"} · flag pages
          and posts from their editors with “Request translation”
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}
      {!error && queryError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {errorMessage(queryError, "Couldn't load translation requests.")}
        </div>
      )}

      <Card className="p-1.5">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.value
                  ? "border-b-2 border-navy text-navy"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {statusCounts[t.value]}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>
            {filtered.length} of {tasks.length} requests shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Content</th>
                  <th className="px-6 py-3 font-medium">Target language</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Requested by</th>
                  <th className="px-6 py-3 font-medium">Requested</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((task) => {
                    const entity = entityMeta[task.entity_type] ?? entityMeta.cms_page;
                    const EntityIcon = entity.icon;
                    return (
                      <tr key={task.id} className="hover:bg-muted/40">
                        <td className="max-w-md px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                entity.className
                              )}
                            >
                              <EntityIcon className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <Link
                                href={entityEditHref(task)}
                                className="block truncate font-medium text-foreground hover:underline"
                              >
                                {task.entity_title ?? "Untitled"}
                              </Link>
                              <p className="truncate text-xs text-muted-foreground">
                                {entity.label}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5">
                            <Languages className="size-3.5 text-muted-foreground" />
                            <span className="text-foreground">
                              {languageLabel(task.target_language_code)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              statusBadgeClass[task.status as TranslationTaskStatus]
                            )}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-foreground">{task.requested_by}</td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(task.created_at), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {(can("cms", "edit") || can("cms", "delete")) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Request actions"
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" alignOffset={-8}>
                                {can("cms", "edit") && task.status !== "done" && (
                                  <DropdownMenuItem
                                    disabled={isMutating}
                                    onClick={() => handleUpdate(task, "done")}
                                  >
                                    <CheckCircle2 />
                                    Mark as done
                                  </DropdownMenuItem>
                                )}
                                {can("cms", "edit") && task.status === "requested" && (
                                  <DropdownMenuItem
                                    disabled={isMutating}
                                    onClick={() => handleUpdate(task, "cancelled")}
                                  >
                                    <XCircle />
                                    Cancel request
                                  </DropdownMenuItem>
                                )}
                                {can("cms", "edit") && task.status !== "requested" && (
                                  <DropdownMenuItem
                                    disabled={isMutating}
                                    onClick={() => handleUpdate(task, "requested")}
                                  >
                                    <RotateCcw />
                                    Re-open request
                                  </DropdownMenuItem>
                                )}
                                {can("cms", "delete") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      variant="destructive"
                                      disabled={isMutating}
                                      onClick={() => handleDelete(task)}
                                    >
                                      <Trash2 />
                                      Delete request
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && !queryError && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      <Languages className="mx-auto mb-2 size-5 text-muted-foreground" />
                      No translation requests yet. Open a page or post editor and click
                      “Request translation”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CmsTranslationsPage() {
  return (
    <PermissionGuard module="cms">
      <TranslationTasks />
    </PermissionGuard>
  );
}
