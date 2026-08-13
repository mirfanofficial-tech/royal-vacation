"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Languages as LanguagesIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  faqGroupsSeed,
  faqQuestionsSeed,
  type FaqGroup,
  type FaqQuestion,
  type FaqQuestionTranslationValue,
} from "@/lib/mock-data";
import { useLanguages } from "@/lib/reference";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RichTextEditor } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";

const UNHELPFUL_THRESHOLD = 70;

function helpfulColor(percent: number) {
  if (percent >= 80) return "text-rating";
  if (percent >= 50) return "text-gold";
  return "text-destructive";
}

function FaqQuestionRow({
  question,
  expanded,
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDrop,
  onDelete,
  onUpdate,
  activeLanguages,
}: {
  question: FaqQuestion;
  expanded: boolean;
  onToggleExpand: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<FaqQuestion>) => void;
  activeLanguages: { code: string; native_name: string }[];
}) {
  const [language, setLanguage] = useState("en");
  const filledSegments = Math.round((question.helpfulPercent / 100) * 6);

  const currentQuestionText =
    language === "en" ? question.question : question.translations[language]?.question ?? "";
  const currentAnswerHtml =
    language === "en" ? question.answerHtml : question.translations[language]?.answerHtml ?? "";

  function updateTranslation(patch: Partial<FaqQuestionTranslationValue>) {
    if (language === "en") {
      onUpdate({
        question: patch.question ?? question.question,
        answerHtml: patch.answerHtml ?? question.answerHtml,
      });
      return;
    }
    onUpdate({
      translations: {
        ...question.translations,
        [language]: {
          question: patch.question ?? question.translations[language]?.question ?? "",
          answerHtml: patch.answerHtml ?? question.translations[language]?.answerHtml ?? "",
        },
      },
    });
  }

  const translatedCount =
    1 + Object.values(question.translations).filter((t) => t.question.trim()).length;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-lg border border-border bg-white"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-sm font-medium text-foreground">{question.question}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full",
                  i < filledSegments ? "bg-rating" : "bg-border"
                )}
              />
            ))}
          </div>
          <span className={cn("text-xs font-medium", helpfulColor(question.helpfulPercent))}>
            {question.helpfulPercent}% helpful
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label="Edit"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border px-3 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {["en", ...activeLanguages.filter((l) => l.code !== "en").map((l) => l.code)].map(
              (code) => {
                const lang = activeLanguages.find((l) => l.code === code);
                const hasContent =
                  code === "en" ? true : Boolean(question.translations[code]?.question);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      language === code ? "text-navy" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        hasContent ? "bg-rating" : "bg-border"
                      )}
                    />
                    {code === "en" ? "EN" : (lang?.code ?? code).toUpperCase()}
                  </button>
                );
              }
            )}
          </div>

          <Input
            value={currentQuestionText}
            onChange={(e) => updateTranslation({ question: e.target.value })}
            placeholder="Question"
            className="text-sm font-medium"
          />
          <RichTextEditor
            key={`${question.id}-${language}`}
            value={currentAnswerHtml}
            onChange={(html) => updateTranslation({ answerHtml: html })}
            placeholder="Write the answer…"
          />

          <p className="text-xs text-muted-foreground">
            {question.viewCount.toLocaleString()} views · Translated to {translatedCount} of{" "}
            {activeLanguages.length} · Updated{" "}
            {formatDistanceToNowStrict(new Date(question.updatedAt), { addSuffix: true })}
          </p>
        </div>
      )}
    </div>
  );
}

function FaqsCatalog() {
  const { languages } = useLanguages();
  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);

  const [groups, setGroups] = useState<FaqGroup[]>(faqGroupsSeed);
  const [questions, setQuestions] = useState<FaqQuestion[]>(faqQuestionsSeed);
  const [selectedGroupId, setSelectedGroupId] = useState(faqGroupsSeed[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupShownOn, setNewGroupShownOn] = useState("");

  const groupQuestions = questions.filter((q) => q.groupId === selectedGroupId);
  const filtered = groupQuestions.filter((q) =>
    q.question.toLowerCase().includes(query.toLowerCase())
  );
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null;

  const flaggedCount = questions.filter((q) => q.helpfulPercent < UNHELPFUL_THRESHOLD).length;

  const needsAttention = useMemo(() => {
    const unhelpful = questions
      .filter((q) => q.helpfulPercent < UNHELPFUL_THRESHOLD)
      .map((q) => ({
        id: q.id,
        title: q.question,
        subtitle: `${q.helpfulPercent}% helpful · ${q.voteCount} votes`,
        kind: "unhelpful" as const,
      }));
    const missingTranslations = questions
      .filter((q) => {
        const translated = Object.values(q.translations).filter((t) => t.question.trim()).length;
        return activeLanguages.length > 1 && translated < activeLanguages.length - 1;
      })
      .map((q) => {
        const translated = Object.values(q.translations).filter((t) => t.question.trim()).length;
        const missing = activeLanguages.length - 1 - translated;
        return {
          id: q.id,
          title: q.question,
          subtitle: `Missing ${missing} translation${missing === 1 ? "" : "s"}`,
          kind: "translation" as const,
        };
      });
    return [...unhelpful, ...missingTranslations].slice(0, 4);
  }, [questions, activeLanguages]);

  function selectQuestion(id: string) {
    const q = questions.find((x) => x.id === id);
    if (q) setSelectedGroupId(q.groupId);
    setExpandedId(id);
  }

  function handleAddQuestion() {
    const id = `faq_new_${Date.now()}`;
    const newQuestion: FaqQuestion = {
      id,
      groupId: selectedGroupId,
      question: "New question",
      answerHtml: "",
      helpfulPercent: 0,
      voteCount: 0,
      viewCount: 0,
      updatedAt: new Date().toISOString(),
      translations: {},
    };
    setQuestions((prev) => [newQuestion, ...prev]);
    setExpandedId(id);
  }

  function handleUpdateQuestion(id: string, patch: Partial<FaqQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q))
    );
  }

  function handleDeleteQuestion(id: string) {
    if (!window.confirm("Delete this question? This can't be undone.")) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const ids = filtered.map((q) => q.id);
    const [movedId] = ids.splice(dragIndex, 1);
    const adjusted = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
    ids.splice(adjusted, 0, movedId);
    setQuestions((prev) => {
      const others = prev.filter((q) => q.groupId !== selectedGroupId);
      const reordered = ids
        .map((id) => prev.find((q) => q.id === id))
        .filter((q): q is FaqQuestion => Boolean(q));
      return [...others, ...reordered];
    });
    setDragIndex(null);
  }

  function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    const id = `group_${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      { id, name: newGroupName.trim(), slug: newGroupName.trim().toLowerCase().replace(/\s+/g, "-"), shownOn: newGroupShownOn.trim() || "/help" },
    ]);
    setSelectedGroupId(id);
    setNewGroupName("");
    setNewGroupShownOn("");
    setGroupSheetOpen(false);
  }

  function handleDeleteGroup(group: FaqGroup) {
    if (questions.some((q) => q.groupId === group.id)) {
      window.alert("Move or delete this group's questions first.");
      return;
    }
    if (!window.confirm(`Delete the "${group.name}" group?`)) return;
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    if (selectedGroupId === group.id) setSelectedGroupId(groups[0]?.id ?? "");
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">FAQs</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions across {groups.length} groups
            {flaggedCount > 0 && ` · ${flaggedCount} flagged as unhelpful this week`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" disabled title="Coming soon">
            Helpfulness report
          </Button>
          <Button size="sm" onClick={handleAddQuestion} disabled={!selectedGroupId}>
            <Plus data-icon="inline-start" />
            New question
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {groups.map((group) => {
          const count = questions.filter((q) => q.groupId === group.id).length;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setSelectedGroupId(group.id);
                setExpandedId(null);
              }}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                selectedGroupId === group.id
                  ? "border-navy text-navy"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {group.name}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardContent className="space-y-3 pt-4">
            {selectedGroup && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedGroup.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {groupQuestions.length} questions · shown on {selectedGroup.shownOn}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleAddQuestion}>
                  <Plus data-icon="inline-start" />
                  Add question
                </Button>
              </div>
            )}

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions and answers…"
                className="pl-8"
              />
            </div>

            <div className="space-y-2">
              {filtered.map((question, index) => (
                <FaqQuestionRow
                  key={question.id}
                  question={question}
                  expanded={expandedId === question.id}
                  onToggleExpand={() =>
                    setExpandedId((prev) => (prev === question.id ? null : question.id))
                  }
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                  onUpdate={(patch) => handleUpdateQuestion(question.id, patch)}
                  activeLanguages={activeLanguages}
                />
              ))}
              {filtered.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {groupQuestions.length === 0
                    ? "No questions in this group yet."
                    : "No questions match your search."}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">FAQ groups</p>
                <button
                  type="button"
                  onClick={() => setGroupSheetOpen(true)}
                  className="text-xs font-medium text-navy hover:text-navy/70"
                >
                  + New
                </button>
              </div>
              {groups.map((group) => {
                const count = questions.filter((q) => q.groupId === group.id).length;
                return (
                  <div
                    key={group.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedGroupId(group.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedGroupId(group.id);
                    }}
                    className={cn(
                      "group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors outline-none",
                      selectedGroupId === group.id
                        ? "bg-navy text-white"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{group.name}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-xs",
                          selectedGroupId === group.id
                            ? "bg-white/15"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count}
                      </span>
                      <button
                        type="button"
                        aria-label={`Delete ${group.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                        className={cn(
                          "flex size-5 items-center justify-center rounded opacity-0 outline-none group-hover:opacity-100 focus-visible:opacity-100",
                          selectedGroupId === group.id
                            ? "text-white/70 hover:bg-white/10"
                            : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        )}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-sm font-semibold text-foreground">Needs attention</p>
              <p className="mb-2 text-xs text-muted-foreground">Low helpfulness or missing translations</p>
              {needsAttention.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectQuestion(item.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      item.kind === "unhelpful"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-sky-100 text-sky-600"
                    )}
                  >
                    {item.kind === "unhelpful" ? (
                      <AlertTriangle className="size-3.5" />
                    ) : (
                      <LanguagesIcon className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
              {needsAttention.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">All clear.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={groupSheetOpen} onOpenChange={setGroupSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New FAQ group</SheetTitle>
            <SheetDescription>Group related questions together.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 px-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Payments"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Shown on</label>
              <Input
                value={newGroupShownOn}
                onChange={(e) => setNewGroupShownOn(e.target.value)}
                placeholder="/help"
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setGroupSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Create group
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function CmsFaqsPage() {
  return (
    <PermissionGuard module="cms">
      <FaqsCatalog />
    </PermissionGuard>
  );
}
