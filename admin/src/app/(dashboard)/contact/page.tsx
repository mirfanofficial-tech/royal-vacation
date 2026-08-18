"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Mail, Phone, RotateCcw } from "lucide-react";

import type { ContactMessageOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useContactMessages } from "@/lib/contact";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusTabs = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
] as const;

type StatusTab = (typeof statusTabs)[number]["value"];

const topicLabels: Record<string, string> = {
  booking: "Booking",
  refund: "Refund",
  invoice: "Invoice",
  stay_issue: "Stay issue",
  group: "Group booking",
  press: "Press",
  other: "Other",
};

const channelLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function ContactInbox() {
  const [statusFilter, setStatusFilter] = useState<StatusTab>("new");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [error, setError] = useState("");

  const { messages, isLoading, updateStatus, isMutating } = useContactMessages({
    status: statusFilter === "all" ? undefined : statusFilter,
    topic: topicFilter === "all" ? undefined : topicFilter,
  });
  const { can } = usePermissions();

  async function handleStatusChange(message: ContactMessageOut, status: "new" | "in_progress" | "resolved") {
    try {
      await updateStatus(message.id, status);
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this message."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
          <Mail className="size-6" />
          Contact Messages
        </h1>
        <p className="text-sm text-muted-foreground">
          Submissions from the client site&apos;s contact form.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      <Card className="p-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  statusFilter === tab.value
                    ? "border-b-2 border-navy text-navy"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className={cn(selectClass, "mr-1.5")}
            aria-label="Filter by topic"
          >
            <option value="all">All topics</option>
            {Object.entries(topicLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <p className="text-lg font-semibold text-foreground">Records</p>
          <p className="text-sm text-muted-foreground">Total: {messages.length} records</p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No messages match this filter.
            </p>
          )}
          {!isLoading &&
            messages.map((message) => (
              <div key={message.id} className="space-y-2 px-6 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{message.full_name}</p>
                      <Badge
                        variant={
                          message.status === "resolved"
                            ? "default"
                            : message.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {message.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="secondary">{topicLabels[message.topic] ?? message.topic}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{message.email}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {message.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {message.phone}
                        </span>
                      )}
                      {message.booking_reference && (
                        <span>Booking ref: {message.booking_reference}</span>
                      )}
                      <span>
                        Prefers: {channelLabels[message.preferred_channel] ?? message.preferred_channel}
                      </span>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(message.created_at)}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">{message.message}</p>
                {can("contact", "edit") && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {message.status !== "in_progress" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleStatusChange(message, "in_progress")}
                      >
                        Mark in progress
                      </Button>
                    )}
                    {message.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleStatusChange(message, "resolved")}
                      >
                        Mark resolved
                      </Button>
                    )}
                    {message.status !== "new" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleStatusChange(message, "new")}
                      >
                        <RotateCcw data-icon="inline-start" />
                        Reopen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContactMessagesPage() {
  return (
    <PermissionGuard module="contact">
      <ContactInbox />
    </PermissionGuard>
  );
}
