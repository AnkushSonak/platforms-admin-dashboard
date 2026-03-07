"use client";

import React, { useState, useCallback } from "react";
import {
  Calendar, Clock, Flag, Tag, Check, AlertTriangle, Link2,
  Sparkles, Plus, X, Edit2, Trash2, ChevronUp, ChevronDown,
  Copy, Eye, List, Upload, Download,
} from "lucide-react";
import { Input } from "../shadcn/ui/input";
import { Button } from "../shadcn/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type EventStatus   = "done" | "active" | "warn" | "future";
export type BadgeVariant  = "done" | "active" | "warn" | "danger" | "null";
export type EventType =
  | "notification" | "application" | "fee" | "admit_card"
  | "exam" | "result" | "interview" | "joining" | "other";
export type FilterTag =
  | "all" | "pending" | "done" | "exam" | "fee"
  | "admit" | "result" | "interview";

/**
 * Full data model for a single timeline event.
 * Every field here maps to a specific element in the job-timeline-v3 HTML.
 */
export interface ITimelineEvent {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** Displayed as the card title (ev-title) */
  label: string;
  /** Human-readable date shown verbatim, e.g. "3rd week of May 2025" (ev-date-val) */
  date: string;
  /** ISO date used for sorting + countdown maths, e.g. "2025-05-19" */
  dateExact: string;
  /** Time string shown in mono, e.g. "6:00 PM IST" (ev-time) */
  time: string;
  /** Appends "· Tentative" next to the time */
  isTentative: boolean;

  // ── Classification ────────────────────────────────────────────────────────
  /** Semantic category of this event */
  type: EventType;
  /** Controls node colour (nd-done/active/warn/future) + left card stripe */
  status: EventStatus;
  /** Badge pills shown on the collapsed card (b-done/active/warn/danger/null) */
  badges: BadgeVariant[];
  /** data-tag attribute — controls which filter tabs surface this event */
  filterTags: FilterTag[];
  /** Icon key for the node dot (lucide icon name) */
  icon: string;
  /** ★ Milestone flag — shown as a gold star badge */
  isMilestone: boolean;

  // ── Expanded content ──────────────────────────────────────────────────────
  /** Paragraph shown in ev-expand > ev-desc */
  description: string;
  /** Info chips in ev-expand (e.g. "₹100 General/OBC", "SC/ST Free") */
  chips: string[];

  // ── Special features ──────────────────────────────────────────────────────
  /** Whether this card shows the live countdown cdTimer (max 1 per timeline) */
  hasCountdown: boolean;
  /** Text shown in ev-attach bar, e.g. "Official PDF · 1 document" */
  attachmentLabel: string;
  /** URL for the attachment */
  attachmentUrl: string;
  /** Legacy/custom tag label */
  tag: string;
  /** Custom colour override — leave blank to derive from status */
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: EventStatus;
  label: string;
  dot: string;
  text: string;
  bg: string;
  border: string;
}[] = [
  { value: "done",   label: "Done",     dot: "bg-emerald-400",  text: "text-emerald-400",  bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  { value: "active", label: "Active",   dot: "bg-blue-400",     text: "text-blue-400",     bg: "bg-blue-400/10",    border: "border-blue-400/25"    },
  { value: "warn",   label: "Warning",  dot: "bg-amber-400",    text: "text-amber-400",    bg: "bg-amber-400/10",   border: "border-amber-400/25"   },
  { value: "future", label: "Upcoming", dot: "bg-zinc-600",     text: "text-zinc-500",     bg: "bg-zinc-700/30",    border: "border-zinc-600/30"    },
];

const BADGE_OPTIONS: {
  value: BadgeVariant;
  label: string;
  text: string;
  bg: string;
  border: string;
}[] = [
  { value: "done",   label: "Done",     text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { value: "active", label: "Active",   text: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20"   },
  { value: "warn",   label: "Warning",  text: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20"  },
  { value: "danger", label: "Today",    text: "text-red-400",     bg: "bg-red-400/10",     border: "border-red-400/20"    },
  { value: "null",   label: "Upcoming", text: "text-zinc-400",    bg: "bg-zinc-700/40",    border: "border-zinc-600/20"   },
];

const FILTER_TAG_OPTIONS: FilterTag[] = [
  "all", "pending", "done", "exam", "fee", "admit", "result", "interview",
];

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "notification", label: "Notification"  },
  { value: "application",  label: "Application"   },
  { value: "fee",          label: "Fee Payment"   },
  { value: "admit_card",   label: "Admit Card"    },
  { value: "exam",         label: "Exam"          },
  { value: "result",       label: "Result"        },
  { value: "interview",    label: "Interview"     },
  { value: "joining",      label: "Joining"       },
  { value: "other",        label: "Other"         },
];

const ICON_OPTIONS = [
  "calendar", "clock", "flag", "tag", "check",
  "alert-triangle", "link", "sparkles",
] as const;

const EMPTY_EVENT: ITimelineEvent = {
  label: "", date: "", dateExact: "", time: "", isTentative: false,
  type: "other", status: "future", badges: [], filterTags: ["all"],
  icon: "calendar", isMilestone: false,
  description: "", chips: [],
  hasCountdown: false, attachmentLabel: "", attachmentUrl: "", tag: "", color: "",
};

const SAMPLE_EVENTS: ITimelineEvent[] = [
  {
    label: "Official Notification Released", date: "14 February 2025", dateExact: "2025-02-14",
    time: "", isTentative: false, type: "notification", status: "done", badges: ["done"],
    filterTags: ["all", "done"], icon: "flag", isMilestone: true, color: "",
    description: "Full notification with eligibility, syllabus, exam pattern and reservation details published on upsc.gov.in. Includes 48-page PDF with complete instructions.",
    chips: ["PDF 48 pages", "upsc.gov.in"],
    hasCountdown: false, attachmentLabel: "Official notification PDF · 1 document", attachmentUrl: "", tag: "",
  },
  {
    label: "Online Application Portal Opens", date: "14 February 2025", dateExact: "2025-02-14",
    time: "11:00 AM IST", isTentative: false, type: "application", status: "done", badges: ["done"],
    filterTags: ["all", "done", "fee"], icon: "calendar", isMilestone: false, color: "",
    description: "Candidates register at upsconline.nic.in using One-Time Registration (OTR). Photo and signature upload required. SC/ST/Women candidates apply free of charge.",
    chips: ["upsconline.nic.in", "OTR Required", "Free for SC/ST/Women"],
    hasCountdown: false, attachmentLabel: "", attachmentUrl: "", tag: "",
  },
  {
    label: "Last Date — Application Submission", date: "Tuesday, 04 March 2025", dateExact: "2025-03-04",
    time: "6:00 PM IST", isTentative: false, type: "application", status: "active", badges: ["danger", "active"],
    filterTags: ["all", "pending", "fee"], icon: "alert-triangle", isMilestone: true, color: "",
    description: "Application window closes at 6:00 PM IST sharp. Incomplete or unpaid applications are auto-rejected with no grace period.",
    chips: ["₹100 General/OBC", "SC/ST/PH/Women Free", "No late fee", "No offline mode"],
    hasCountdown: true, attachmentLabel: "", attachmentUrl: "", tag: "",
  },
  {
    label: "Admit Card / e-Hall Ticket", date: "3rd week of May 2025", dateExact: "2025-05-19",
    time: "", isTentative: true, type: "admit_card", status: "future", badges: ["null"],
    filterTags: ["all", "pending", "admit"], icon: "calendar", isMilestone: false, color: "",
    description: "Downloadable 7–10 days before exam. Must carry printed copy with valid photo ID. No admit card = no entry.",
    chips: ["Photo ID mandatory", "Print + carry original"],
    hasCountdown: false, attachmentLabel: "", attachmentUrl: "", tag: "",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return s;
  }
}

function daysLeft(s: string): number {
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
}

function isFuture(s: string): boolean {
  return new Date(s) > new Date();
}

function getLucideIcon(name: string, className = "w-3.5 h-3.5"): React.ReactNode {
  const props = { className, strokeWidth: 2 };
  switch (name) {
    case "flag":            return <Flag {...props} />;
    case "tag":             return <Tag {...props} />;
    case "clock":           return <Clock {...props} />;
    case "check":           return <Check {...props} />;
    case "alert-triangle":  return <AlertTriangle {...props} />;
    case "link":            return <Link2 {...props} />;
    case "sparkles":        return <Sparkles {...props} />;
    default:                return <Calendar {...props} />;
  }
}

function getStatusConfig(status: EventStatus) {
  return STATUS_OPTIONS?.find((s) => s.value === status) ?? STATUS_OPTIONS[3];
}

function getBadgeConfig(badge: BadgeVariant) {
  return BADGE_OPTIONS?.find((b) => b.value === badge) ?? BADGE_OPTIONS[4];
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Section divider inside form ───────────────────────────────────────────────
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-white/[0.06] pb-2">
        <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500">{title}</p>
        {description && <p className="text-[11px] text-zinc-600 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-zinc-800/70 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 placeholder:text-zinc-600 transition-colors font-sans";

const labelCls = "block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1.5";

// ── Chip editor ────────────────────────────────────────────────────────────────
function ChipEditor({
  chips,
  onChange,
}: {
  chips: string[];
  onChange: (chips: string[]) => void;
}) {
  const [val, setVal] = useState("");

  const add = useCallback(() => {
    if (!val.trim()) return;
    onChange([...chips, val.trim()]);
    setVal("");
  }, [val, chips, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {chips?.length === 0 && (
          <span className="text-[11px] text-zinc-600 italic">No chips yet</span>
        )}
        {chips?.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 bg-zinc-700/50 border border-white/[0.07] rounded-md px-2.5 py-1 text-[11px] text-zinc-300"
          >
            {c}
            <button
              type="button"
              onClick={() => onChange(chips?.filter((_, j) => j !== i))}
              className="text-zinc-500 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={`${inputCls} text-[12px]`}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
          placeholder="e.g. ₹100 General/OBC — press Enter"
        />
        <button
          type="button"
          onClick={add}
          className="flex-shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
    </div>
  );
}

// ── Badge multi-select ─────────────────────────────────────────────────────────
function BadgeSelect({
  value,
  onChange,
}: {
  value: BadgeVariant[];
  onChange: (v: BadgeVariant[]) => void;
}) {
  const toggle = (v: BadgeVariant) =>
    onChange(value?.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-wrap gap-2">
      {BADGE_OPTIONS.map((b) => {
        const on = value?.includes(b.value);
        return (
          <Button
            key={b.value}
            type="button"
            onClick={() => toggle(b.value)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
              on
                ? `${b.bg} ${b.text} ${b.border}`
                : "bg-zinc-800 text-zinc-500 border-white/[0.07] hover:border-white/20"
            }`}
          >
            {b.label}
          </Button>
        );
      })}
    </div>
  );
}

// ── Filter-tag multi-select ────────────────────────────────────────────────────
function FilterTagSelect({
  value,
  onChange,
}: {
  value: FilterTag[];
  onChange: (v: FilterTag[]) => void;
}) {
  const toggle = (v: FilterTag) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_TAG_OPTIONS.map((t) => {
        const on = value?.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              on
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : "bg-zinc-800 text-zinc-500 border-white/[0.07] hover:border-white/20"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

// ── Timeline event preview card ────────────────────────────────────────────────
function PreviewCard({ ev }: { ev: ITimelineEvent }) {
  const [open, setOpen] = useState(false);
  const sc = getStatusConfig(ev.status);
  const days = ev.dateExact ? daysLeft(ev.dateExact) : null;
  const up = ev.dateExact ? isFuture(ev.dateExact) : false;

  const stripeColor: Record<EventStatus, string> = {
    done:   "bg-emerald-400",
    active: "bg-blue-400",
    warn:   "bg-amber-400",
    future: "bg-zinc-600",
  };

  return (
    <div className="flex items-start gap-3 pb-2">
      {/* gutter */}
      <div className="w-10 flex-shrink-0 flex flex-col items-center pt-3 gap-1">
        <span className="font-mono text-[8px] leading-tight text-zinc-600 text-center">
          {ev.dateExact
            ? new Date(ev.dateExact)
                .toLocaleDateString("en-US", { month: "short", day: "numeric" })
                .split(" ")
                .join("\n")
            : "--"}
        </span>
        {/* node */}
        <div
          className={`w-6 h-6 rounded-full border-2 border-[#08090C] flex items-center justify-center flex-shrink-0 z-10 ${
            ev.status === "future"
              ? "bg-zinc-700 border-zinc-600"
              : ev.status === "done"
              ? "bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,.15)]"
              : ev.status === "active"
              ? "bg-blue-400 shadow-[0_0_0_4px_rgba(91,141,239,.25)] animate-pulse"
              : "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,.15)]"
          }`}
        >
          {ev.status === "done" && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
        </div>
      </div>

      {/* card */}
      <div
        className="flex-1 bg-[#0F1117] border border-white/[0.09] rounded-xl overflow-hidden cursor-pointer hover:border-white/[0.14] transition-all hover:translate-x-1 hover:shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {/* status stripe */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${stripeColor[ev.status]}`} style={{ position: "absolute" }} />

        <div className="px-4 py-3 relative">
          {/* chevron */}
          <ChevronDown
            className={`absolute right-3 top-3.5 w-3 h-3 text-zinc-500 transition-transform ${open ? "rotate-180 text-blue-400" : ""}`}
          />

          {/* head */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <span className={`text-[13px] font-bold leading-snug tracking-tight flex-1 ${ev.status === "done" ? "text-zinc-400" : "text-zinc-100"}`}>
              {ev.label}
            </span>
            <div className="flex flex-col gap-1 items-end flex-shrink-0">
              {ev.badges?.map((b) => {
                const bc = getBadgeConfig(b);
                return (
                  <span
                    key={b}
                    className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}
                  >
                    {bc.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* date row */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            <span className="text-[11.5px]">{ev.date}</span>
            {ev.time && (
              <span className="font-mono text-[10px] text-zinc-600">{ev.time}</span>
            )}
            {ev.isTentative && (
              <span className="font-mono text-[10px] text-zinc-600">· Tentative</span>
            )}
          </div>

          {/* countdown */}
          {ev.dateExact && days !== null && (
            <div className="mt-1">
              <span className={`font-mono text-[10.5px] font-semibold ${up ? "text-blue-400" : "text-zinc-500"}`}>
                {up
                  ? days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`
                  : `${Math.abs(days)} days ago`}
              </span>
            </div>
          )}

          {ev.isMilestone && (
            <div className="mt-1.5">
              <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                ★ Milestone
              </span>
            </div>
          )}
        </div>

        {/* expanded section */}
        {open && (ev.description || ev.chips.length > 0) && (
          <div className="border-t border-white/[0.06] mx-4 py-3 flex flex-col gap-2">
            {ev.description && (
              <p className="text-[12px] text-zinc-400 leading-relaxed">{ev.description}</p>
            )}
            {ev.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ev.chips.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10.5px] text-zinc-500 bg-zinc-800/80 border border-white/[0.06] rounded-md px-2 py-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* attachment */}
        {ev.attachmentLabel && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/[0.06] text-[10.5px] text-zinc-500">
            <Link2 className="w-3 h-3" />
            {ev.attachmentLabel}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event form (add / edit) ────────────────────────────────────────────────────
function EventForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ITimelineEvent;
  onSave: (ev: ITimelineEvent) => void;
  onCancel: () => void;
}) {
  const [ev, setEv] = useState<ITimelineEvent>(initial ?? { ...EMPTY_EVENT });
  const set = <K extends keyof ITimelineEvent>(k: K, v: ITimelineEvent[K]) =>
    setEv((e) => ({ ...e, [k]: v }));

  const valid = ev.label.trim() !== "" && (ev.date.trim() !== "" || ev.dateExact !== "");

  return (
    <div className="flex flex-col gap-8">

      {/* ── Date & Identity ── */}
      <FormSection
        title="Date & Identity"
        description="What this event is and when it happens"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>
              Event Title <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls}
              value={ev.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="e.g. Last Date — Application Submission"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Display Date <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls}
                value={ev.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. Tuesday, 04 March 2025"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Shown verbatim on the timeline card
              </p>
            </div>
            <div>
              <label className={labelCls}>Exact Date (for sorting)</label>
              <input
                type="date"
                className={inputCls}
                value={ev.dateExact}
                onChange={(e) => set("dateExact", e.target.value)}
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Powers countdown &amp; auto-sorting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Time</label>
              <Input
                className={inputCls}
                value={ev.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="e.g. 6:00 PM IST"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="tentative"
                checked={ev.isTentative}
                onChange={(e) => set("isTentative", e.target.checked)}
                className="w-4 h-4 accent-amber-400"
              />
              <label htmlFor="tentative" className="text-sm text-zinc-300 cursor-pointer">
                Mark as Tentative
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── Classification ── */}
      <FormSection
        title="Status & Classification"
        description="Controls node colour, stripe and filter visibility"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Event Type</label>
              <select
                className={inputCls}
                value={ev.type}
                onChange={(e) => set("type", e.target.value as EventType)}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Node Status</label>
              <select
                className={inputCls}
                value={ev.status}
                onChange={(e) => set("status", e.target.value as EventStatus)}
              >
                {STATUS_OPTIONS?.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Badges{" "}
              <span className="normal-case font-normal text-zinc-600">
                (shown on card — multi-select)
              </span>
            </label>
            <BadgeSelect value={ev.badges} onChange={(v) => set("badges", v)} />
          </div>

          <div>
            <label className={labelCls}>
              Filter Tags{" "}
              <span className="normal-case font-normal text-zinc-600">
                (controls All / Pending / Done etc. filter tabs)
              </span>
            </label>
            <FilterTagSelect
              value={ev.filterTags}
              onChange={(v) => set("filterTags", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Icon</label>
              <select
                className={inputCls}
                value={ev.icon}
                onChange={(e) => set("icon", e.target.value)}
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {i.charAt(0).toUpperCase() + i.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="milestone"
                checked={ev.isMilestone}
                onChange={(e) => set("isMilestone", e.target.checked)}
                className="w-4 h-4 accent-amber-400"
              />
              <label htmlFor="milestone" className="text-sm text-zinc-300 cursor-pointer">
                ★ Mark as Milestone
              </label>
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── Expanded Content ── */}
      <FormSection
        title="Expanded Content"
        description="Shown when the user taps the card to expand it"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} resize-y min-h-[80px]`}
              value={ev.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Explain what happens, rules, important notes…"
            />
          </div>
          <div>
            <label className={labelCls}>
              Info Chips{" "}
              <span className="normal-case font-normal text-zinc-600">
                (press Enter or click Add)
              </span>
            </label>
            <ChipEditor
              chips={ev.chips}
              onChange={(v) => set("chips", v)}
            />
          </div>
        </div>
      </FormSection>

      {/* ── Special Features ── */}
      <FormSection
        title="Special Features"
        description="Optional extras for this card"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="countdown"
              checked={ev.hasCountdown}
              onChange={(e) => set("hasCountdown", e.target.checked)}
              className="w-4 h-4 accent-red-400 mt-0.5"
            />
            <div>
              <label htmlFor="countdown" className="text-sm text-zinc-300 cursor-pointer font-medium">
                Show live countdown timer on this card
              </label>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Renders a ticking "Closes in HH:MM:SS" widget. Only one per
                timeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Attachment Label</label>
              <input
                className={inputCls}
                value={ev.attachmentLabel}
                onChange={(e) => set("attachmentLabel", e.target.value)}
                placeholder="e.g. Official PDF · 1 document"
              />
            </div>
            <div>
              <label className={labelCls}>Attachment URL</label>
              <input
                className={inputCls}
                value={ev.attachmentUrl}
                onChange={(e) => set("attachmentUrl", e.target.value)}
                placeholder="https://upsc.gov.in/…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Custom Colour Override</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={ev.color || "#6366f1"}
                  onChange={(e) => set("color", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/10 cursor-pointer bg-zinc-800 p-0.5"
                />
                <input
                  className={`${inputCls} font-mono text-xs`}
                  value={ev.color}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="#6366f1 (leave blank for auto)"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Custom Tag</label>
              <input
                className={inputCls}
                value={ev.tag}
                onChange={(e) => set("tag", e.target.value)}
                placeholder="e.g. urgent"
              />
            </div>
          </div>
        </div>
      </FormSection>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={() => valid && onSave(ev)}
          disabled={!valid}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
        >
          <Check className="w-4 h-4" />
          {initial ? "Save Changes" : "Add Event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm px-5 py-2.5 rounded-xl border border-white/[0.07] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  value?: ITimelineEvent[];
  onChange?: (value: ITimelineEvent[]) => void;
}

type TabMode = "list" | "add" | "edit" | "preview";

export function ImportantDatesManager({ value, onChange }: Props) {
  // Allow usage as controlled or standalone
  const [internalEvents, setInternalEvents] = useState<ITimelineEvent[]>(
    value ?? SAMPLE_EVENTS,
  );
  const events = value ?? internalEvents;

  const setEvents = useCallback(
    (next: ITimelineEvent[]) => {
      setInternalEvents(next);
      onChange?.(next);
    },
    [onChange],
  );

  const [tab, setTab] = useState<TabMode>("list");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  // ── Event operations ───────────────────────────────────────────────────────
  const addEvent = (ev: ITimelineEvent) => {
    setEvents([...events, ev]);
    setTab("list");
  };

  const saveEvent = (ev: ITimelineEvent) => {
    setEvents(events.map((x, i) => (i === editIdx ? ev : x)));
    setTab("list");
    setEditIdx(null);
  };

  const removeEvent = (i: number) => {
    setEvents(events.filter((_, j) => j !== i));
    if (editIdx === i) { setTab("list"); setEditIdx(null); }
  };

  const moveEvent = (i: number, dir: "up" | "down") => {
    const to = dir === "up" ? i - 1 : i + 1;
    if (to < 0 || to >= events.length) return;
    const n = [...events];
    [n[i], n[to]] = [n[to], n[i]];
    setEvents(n);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError("");
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("Must be a JSON array");
      setEvents(parsed as ITimelineEvent[]);
      setImportText("");
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs: { key: TabMode; label: string; icon: React.ReactNode }[] = [
    { key: "list",    label: "Events",    icon: <List className="w-3.5 h-3.5" />    },
    { key: "add",     label: "Add Event", icon: <Plus className="w-3.5 h-3.5" />    },
    { key: "preview", label: "Preview",   icon: <Eye className="w-3.5 h-3.5" />     },
  ];

  const sortedForPreview = [...events].sort(
    (a, b) =>
      new Date(a.dateExact || a.date).getTime() -
      new Date(b.dateExact || b.date).getTime(),
  );

  return (
    <div className="bg-[#08090C] text-zinc-100 min-h-screen font-sans">

      {/* ── Top bar ── */}
      <div className="bg-[#0F1117] border-b border-white/[0.07] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-black tracking-tight leading-none">
              Important Dates
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Timeline event manager
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-600 bg-zinc-800/60 border border-white/[0.06] px-2.5 py-1 rounded-full">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={copyJSON}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.07] text-zinc-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Export JSON"}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-20">

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-800/50 border border-white/[0.06] rounded-xl p-1 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                if (t.key !== "list" && t.key !== "edit") setEditIdx(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key || (t.key === "list" && tab === "edit")
                  ? "bg-[#0F1117] text-zinc-100 shadow-sm border border-white/[0.08]"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LIST TAB ── */}
        {(tab === "list" || tab === "edit") && (
          <div className="flex flex-col gap-3">

            {/* Inline edit form */}
            {tab === "edit" && editIdx !== null && (
              <div className="bg-[#0F1117] border border-blue-500/30 rounded-2xl p-6 mb-2">
                <p className="text-sm font-black tracking-tight text-blue-400 mb-6 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editing: {events[editIdx]?.label}
                </p>
                <EventForm
                  initial={events[editIdx]}
                  onSave={saveEvent}
                  onCancel={() => { setTab("list"); setEditIdx(null); }}
                />
              </div>
            )}

            {/* Empty state */}
            {events.length === 0 && tab === "list" && (
              <div className="text-center py-20 text-zinc-600">
                <Calendar className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">No events yet. Click "Add Event" to begin.</p>
              </div>
            )}

            {/* Event rows */}
            {events.map((ev, i) => {
              const sc = getStatusConfig(ev.status);
              const days = ev.dateExact ? daysLeft(ev.dateExact) : null;
              const up = ev.dateExact ? isFuture(ev.dateExact) : false;

              return (
                <div
                  key={i}
                  className="group relative bg-[#0F1117] border border-white/[0.07] hover:border-white/[0.12] rounded-xl flex items-start gap-3 px-4 py-3 transition-all overflow-hidden"
                >
                  {/* status stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${sc.dot}`} />

                  {/* node */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ml-1 ${
                      ev.status === "future"
                        ? "bg-zinc-700 border border-zinc-600"
                        : `${sc.dot} border-2 border-[#08090C]`
                    }`}
                  >
                    {ev.status === "done" && (
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-[13.5px] text-zinc-100 tracking-tight">
                        {ev.label}
                      </span>
                      {ev.isMilestone && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          ★ Milestone
                        </span>
                      )}
                      {ev.badges?.map((b) => {
                        const bc = getBadgeConfig(b);
                        return (
                          <span
                            key={b}
                            className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border ${bc.bg} ${bc.text} ${bc.border}`}
                          >
                            {bc.label}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] text-zinc-400">{ev.date}</span>
                      {ev.time && (
                        <span className="font-mono text-[10.5px] text-zinc-600">
                          {ev.time}
                        </span>
                      )}
                      {ev.isTentative && (
                        <span className="font-mono text-[10px] text-zinc-600">
                          · Tentative
                        </span>
                      )}
                      {days !== null && (
                        <span
                          className={`font-mono text-[10.5px] font-semibold ${up ? "text-blue-400" : "text-zinc-600"}`}
                        >
                          {up
                            ? days === 0 ? "· Today!"
                            : days === 1 ? "· Tomorrow"
                            : `· In ${days} days`
                            : `· ${Math.abs(days)} days ago`}
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-[11.5px] text-zinc-500 mt-1 leading-relaxed line-clamp-1">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mt-1.5">
                      {ev.chips?.slice(0, 4).map((c, ci) => (
                        <span
                          key={ci}
                          className="text-[10px] text-zinc-600 bg-zinc-800/60 border border-white/[0.05] rounded px-2 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                      {ev.chips?.length > 4 && (
                        <span className="text-[10px] text-zinc-600">
                          +{ev.chips.length - 4} more
                        </span>
                      )}
                      {ev.filterTags?.map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[9.5px] text-zinc-600 bg-zinc-800 border border-white/[0.05] rounded px-1.5 py-0.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => moveEvent(i, "up")}
                      disabled={i === 0}
                      className="p-1.5 rounded-md hover:bg-zinc-700 disabled:opacity-25 transition-colors text-zinc-400"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveEvent(i, "down")}
                      disabled={i === events.length - 1}
                      className="p-1.5 rounded-md hover:bg-zinc-700 disabled:opacity-25 transition-colors text-zinc-400"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditIdx(i); setTab("edit"); }}
                      className="p-1.5 rounded-md hover:bg-blue-500/20 transition-colors text-blue-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeEvent(i)}
                      className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add button */}
            {tab === "list" && (
              <button
                onClick={() => setTab("add")}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 hover:border-blue-500/50 hover:text-blue-400 rounded-xl py-4 text-sm font-semibold text-zinc-500 transition-all mt-1"
              >
                <Plus className="w-4 h-4" /> Add New Event
              </button>
            )}

            {/* JSON Import */}
            {tab === "list" && (
              <div className="bg-[#0F1117] border border-white/[0.06] rounded-xl p-4 mt-2">
                <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Upload className="w-3 h-3" /> Import JSON
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste a JSON array of ITimelineEvent objects…'
                  rows={3}
                  className={`${inputCls} font-mono text-[11px] resize-none`}
                />
                {importError && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {importError}
                  </p>
                )}
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="mt-2 flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-zinc-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-3 h-3" /> Import
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ADD TAB ── */}
        {tab === "add" && (
          <div className="bg-[#0F1117] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-base font-black tracking-tight mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              New Timeline Event
            </p>
            <EventForm
              onSave={addEvent}
              onCancel={() => setTab("list")}
            />
          </div>
        )}

        {/* ── PREVIEW TAB ── */}
        {tab === "preview" && (
          <div className="bg-[#0F1117] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-base font-black tracking-tight">Timeline Preview</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Matches job-timeline-v3 visual style · sorted by date
                </p>
              </div>
              <span className="font-mono text-[11px] text-zinc-600 bg-zinc-800 border border-white/[0.06] px-2.5 py-1 rounded-full">
                {sortedForPreview.length} events
              </span>
            </div>

            {sortedForPreview.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">
                <Calendar className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">No events to preview.</p>
              </div>
            ) : (
              <div className="relative pl-10">
                {/* spine */}
                <div className="absolute left-[20px] top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-emerald-400 via-blue-400 to-transparent rounded-full" />
                <div className="flex flex-col gap-0">
                  {sortedForPreview.map((ev, i) => (
                    <PreviewCard key={i} ev={ev} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImportantDatesManager;