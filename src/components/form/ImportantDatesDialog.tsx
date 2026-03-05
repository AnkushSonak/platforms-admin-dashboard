"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/ui/dialog";
import {
  X,
  Plus,
  Calendar,
  Flag,
  Tag,
  Edit,
  Copy,
  ChevronUp,
  ChevronDown,
  Milestone,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImportantDateType = "application" | "exam" | "result" | "other";

export interface IImportantDate {
  label: string;
  date: string;
  type: ImportantDateType;
  description?: string;
  tag?: string;
  isMilestone?: boolean;
  color?: string;
  icon?: string;
}

interface Props {
  value: IImportantDate[];
  onChange: (value: IImportantDate[]) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: {
  value: ImportantDateType;
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
}[] = [
  {
    value: "application",
    label: "Application",
    icon: <Calendar size={14} />,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  {
    value: "exam",
    label: "Exam",
    icon: <Flag size={14} />,
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  {
    value: "result",
    label: "Result",
    icon: <CheckCircle2 size={14} />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    value: "other",
    label: "Other",
    icon: <Tag size={14} />,
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
];

const ICON_OPTIONS = [
  { value: "calendar", label: "Calendar", icon: <Calendar size={16} /> },
  { value: "flag", label: "Flag", icon: <Flag size={16} /> },
  { value: "tag", label: "Tag", icon: <Tag size={16} /> },
  { value: "edit", label: "Edit", icon: <Edit size={16} /> },
  { value: "milestone", label: "Milestone", icon: <Milestone size={16} /> },
  { value: "clock", label: "Clock", icon: <Clock size={16} /> },
  { value: "sparkles", label: "Sparkles", icon: <Sparkles size={16} /> },
  { value: "alert", label: "Alert", icon: <AlertCircle size={16} /> },
];

const EMPTY_FORM: IImportantDate = {
  label: "",
  date: "",
  type: "other",
  description: "",
  tag: "",
  isMilestone: false,
  color: "#6366f1",
  icon: "calendar",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getIconComponent(iconName?: string, size = 16): React.ReactNode {
  switch (iconName) {
    case "flag":
      return <Flag size={size} />;
    case "tag":
      return <Tag size={size} />;
    case "edit":
      return <Edit size={size} />;
    case "milestone":
      return <Milestone size={size} />;
    case "clock":
      return <Clock size={size} />;
    case "sparkles":
      return <Sparkles size={size} />;
    case "alert":
      return <AlertCircle size={size} />;
    default:
      return <Calendar size={size} />;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now();
}

function getDaysRemaining(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ImportantDateType }) {
  const opt = TYPE_OPTIONS.find((t) => t.value === type) ?? TYPE_OPTIONS[3];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${opt.bg} ${opt.text} ${opt.border}`}
    >
      {opt.icon}
      {opt.label}
    </span>
  );
}

// ─── Timeline Preview ─────────────────────────────────────────────────────────

function TimelinePreview({ items }: { items: IImportantDate[] }) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <Calendar size={32} className="mb-2 opacity-30" />
        <p className="text-sm">No dates added yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent rounded-full" />

      <div className="flex flex-col gap-5">
        {sorted.map((item, idx) => {
          const upcoming = isUpcoming(item.date);
          const days = getDaysRemaining(item.date);
          const typeOpt = TYPE_OPTIONS.find((t) => t.value === item.type);

          return (
            <div key={idx} className="relative flex gap-3 group">
              {/* dot */}
              <div
                className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center flex-shrink-0 z-10"
                style={{ backgroundColor: item.color ?? "#6366f1" }}
              >
                <span style={{ color: "#fff" }}>
                  {getIconComponent(item.icon, 10)}
                </span>
              </div>

              {/* card */}
              <div
                className={`flex-1 rounded-xl border p-3 transition-all duration-200 group-hover:shadow-md ${
                  item.isMilestone
                    ? "border-amber-300 bg-amber-50/60"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">
                        {item.label}
                      </span>
                      {item.isMilestone && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                          <Milestone size={10} /> Milestone
                        </span>
                      )}
                      {item.tag && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                          #{item.tag}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <TypeBadge type={item.type} />
                    <span className="text-xs text-gray-400 font-mono">
                      {formatDate(item.date)}
                    </span>
                    {upcoming ? (
                      <span className="text-xs text-indigo-500 font-medium">
                        {days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {Math.abs(days)} days ago
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ImportantDatesDialog({ value = [], onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<IImportantDate>({ ...EMPTY_FORM });
  const [activeTab, setActiveTab] = useState<"list" | "timeline">("list");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);

  const safeValue = Array.isArray(value) ? value : [];

  // ── Reorder ──────────────────────────────────────────────────────────────

  const moveDate = useCallback(
    (from: number, direction: "up" | "down") => {
      const to = direction === "up" ? from - 1 : from + 1;
      if (to < 0 || to >= safeValue.length) return;
      const next = [...safeValue];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
    [safeValue, onChange]
  );

  // ── Add / Edit ────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditIdx(null);
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setForm({ ...safeValue[idx] });
  };

  const saveDate = () => {
    if (!form.label.trim() || !form.date) return;
    const next = [...safeValue];
    if (editIdx !== null) {
      next[editIdx] = { ...form };
    } else {
      next.push({ ...form });
    }
    onChange(next);
    setEditIdx(null);
    setForm({ ...EMPTY_FORM });
  };

  const cancelEdit = () => {
    setEditIdx(null);
    setForm({ ...EMPTY_FORM });
  };

  // ── Remove ────────────────────────────────────────────────────────────────

  const removeDate = (idx: number) =>
    onChange(safeValue.filter((_, i) => i !== idx));

  // ── Import / Export ───────────────────────────────────────────────────────

  const exportDates = async () => {
    await navigator.clipboard.writeText(JSON.stringify(safeValue, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError("");
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("Must be a JSON array");
      onChange(parsed as IImportantDate[]);
      setImportText("");
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const isEditing = editIdx !== null;
  const formValid = form.label.trim() !== "" && form.date !== "";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        <Calendar size={16} />
        Manage Important Dates
        {safeValue.length > 0 && (
          <span className="ml-1 bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {safeValue.length}
          </span>
        )}
      </Button>

      <Button
        type="button"
        onClick={exportDates}
        size="sm"
        variant="outline"
        className="inline-flex items-center gap-1 text-xs"
        title="Copy JSON to clipboard"
      >
        {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? "Copied!" : "Export"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl shadow-2xl">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                Important Dates
              </DialogTitle>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-3 bg-gray-100 rounded-lg p-1 w-fit">
              {(["list", "timeline"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </DialogHeader>

          {/* ── Scrollable Body ─────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            {/* ── LIST TAB ───────────────────────────────────────────────────── */}
            {activeTab === "list" && (
              <div className="space-y-3">
                {safeValue.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Calendar size={36} className="mb-2 opacity-25" />
                    <p className="text-sm">No dates yet. Add one below.</p>
                  </div>
                )}

                {safeValue.map((item, idx) => (
                  <div
                    key={idx}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm ${
                      item.isMilestone
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-gray-100 bg-gray-50/60"
                    }`}
                  >
                    {/* color dot */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.color ?? "#6366f1" }}
                    >
                      <span className="text-white">
                        {getIconComponent(item.icon, 14)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-gray-800 truncate">
                          {item.label}
                        </span>
                        <TypeBadge type={item.type} />
                        {item.isMilestone && (
                          <span className="text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200 font-medium">
                            Milestone
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 font-mono">
                          {formatDate(item.date)}
                        </span>
                        {isUpcoming(item.date) ? (
                          <span className="text-xs text-indigo-500">
                            · In {getDaysRemaining(item.date)} days
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">· Past</span>
                        )}
                        {item.tag && (
                          <span className="text-xs text-indigo-500">
                            #{item.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveDate(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDate(idx, "down")}
                        disabled={idx === safeValue.length - 1}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(idx)}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDate(idx)}
                        className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add button */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  >
                    <Plus size={16} />
                    Add Date
                  </button>
                )}

                {/* ── Form (inline add / edit) ──────────────────────────────── */}
                {(isEditing || editIdx === null) && (
                  <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-4 space-y-3 mt-2">
                    <p className="text-sm font-semibold text-indigo-700">
                      {isEditing ? "Edit Date" : "New Date"}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">
                          Label <span className="text-red-400">*</span>
                        </label>
                        <Input
                          value={form.label}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, label: e.target.value }))
                          }
                          placeholder="e.g. Application Deadline"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Date <span className="text-red-400">*</span>
                        </label>
                        <Input
                          type="date"
                          value={form.date}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, date: e.target.value }))
                          }
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Type
                        </label>
                        <select
                          value={form.type}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              type: e.target.value as ImportantDateType,
                            }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          {TYPE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">
                          Description
                        </label>
                        <Input
                          value={form.description ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Optional description"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Tag
                        </label>
                        <Input
                          value={form.tag ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, tag: e.target.value }))
                          }
                          placeholder="e.g. important"
                          className="bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Icon
                        </label>
                        <select
                          value={form.icon ?? "calendar"}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, icon: e.target.value }))
                          }
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          {ICON_OPTIONS.map((i) => (
                            <option key={i.value} value={i.value}>
                              {i.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={!!form.isMilestone}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                isMilestone: e.target.checked,
                              }))
                            }
                            className="accent-amber-500 w-4 h-4"
                          />
                          <Milestone size={14} className="text-amber-600" />
                          Milestone
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500">Color</label>
                        <input
                          type="color"
                          value={form.color ?? "#6366f1"}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, color: e.target.value }))
                          }
                          className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                        />
                        <span
                          className="text-xs font-mono text-gray-400"
                          style={{ color: form.color }}
                        >
                          {form.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={saveDate}
                        disabled={!formValid}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm px-4"
                      >
                        {isEditing ? "Save Changes" : "Add Date"}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          className="rounded-lg text-sm px-4"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Import ──────────────────────────────────────────────── */}
                <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Upload size={12} /> Import JSON
                  </p>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='Paste JSON array here, e.g. [{"label":"...","date":"..."}]'
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                  {importError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {importError}
                    </p>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleImport}
                    disabled={!importText.trim()}
                    className="text-xs rounded-lg"
                  >
                    <Download size={12} className="mr-1" /> Import
                  </Button>
                </div>
              </div>
            )}

            {/* ── TIMELINE TAB ───────────────────────────────────────────────── */}
            {activeTab === "timeline" && (
              <TimelinePreview items={safeValue} />
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 shrink-0 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {safeValue.length} date{safeValue.length !== 1 ? "s" : ""} total
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={exportDates}
                size="sm"
                className="text-xs rounded-lg"
              >
                <Copy size={12} className="mr-1" />
                {copied ? "Copied!" : "Export JSON"}
              </Button>
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm px-4"
              >
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





// TODO: Future Enhancements

// Recurring Dates: Support for recurring events (e.g., yearly, monthly).
// Date Range: Allow start and end dates for events (e.g., application window).
// Reminders/Notifications: Option to set reminders for key dates.
// Attachments: Allow uploading files (PDFs, notices) linked to a date.
// Rich Text Description: Use a rich text editor for descriptions.
// Custom Icons: Let users pick from a wider set of icons or upload their own.
// Multiple Colors/Gradients: Advanced color selection for timeline visualization.
// Visibility Controls: Mark dates as public/private or admin-only.
// Advanced Timeline UI: Interactive timeline with zoom, filter, and search.
// Calendar Sync: Export dates to Google Calendar, Outlook, etc.
// Audit Trail: Track who added/edited each date and when.
// Bulk Actions: Select multiple dates for batch delete, tag, or export.
// Tagging & Filtering: Add multiple tags and filter by type, tag, or milestone.
// Accessibility: Full keyboard navigation, ARIA labels, and screen reader support.

// UX/UI Enhancements
// Inline Editing: Edit dates directly in the timeline/list view.
// Animated Transitions: Smooth animations for adding/removing/reordering.
// Mobile Optimization: Responsive design for mobile users.
// Timeline Export: Export timeline as image or PDF for sharing.

// Integration/Automation
// API Integration: Sync dates with backend or external sources.
// Validation Rules: Custom validation (e.g., no overlapping exam dates).
// Localization: Support for multiple languages and date formats.