import React, { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/ui/dialog";
import { X, Plus, Calendar, Flag, Tag, Edit, Copy } from "lucide-react";
import {  IImportantDate, ImportantDateType } from "@/app/helper/interfaces/IImportantDate";

interface Props {
  value: IImportantDate[];
  onChange: (value: IImportantDate[]) => void;
}

const typeOptions: { value: ImportantDateType; label: string; icon: React.ReactNode }[] = [
  { value: "application", label: "Application", icon: <Calendar size={16} /> },
  { value: "exam", label: "Exam", icon: <Flag size={16} /> },
  { value: "result", label: "Result", icon: <Tag size={16} /> },
  { value: "other", label: "Other", icon: <Edit size={16} /> },
];

export function ImportantDatesDialog({ value = [], onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<IImportantDate>({ label: "", date: "", type: "other", description: "", tag: "", isMilestone: false, color: "#1976d2", icon: "calendar" });
  const [importJson, setImportJson] = useState("");

  // Drag-and-drop reordering (simple)
  const moveDate = (from: number, to: number) => {
    if (from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  // Add/edit dialog
  const openDialog = (idx?: number) => {
    setEditIdx(idx ?? null);
    setForm(idx !== undefined ? { ...value[idx] } : { label: "", date: "", type: "other", description: "", tag: "", isMilestone: false, color: "#1976d2", icon: "calendar" });
    setIsOpen(true);
  };
  const saveDate = () => {
    if (!form.label.trim() || !form.date) return;
    const safeValue = Array.isArray(value) ? value : [];
    const next = [...safeValue];
    if (editIdx !== null && editIdx !== undefined) {
      next[editIdx] = { ...form };
    } else {
      next.push({ ...form });
    }
    onChange(next);
    setIsOpen(false);
  };

  // Remove
  const removeDate = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  // Bulk import/export
  const exportDates = () => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };
  const importDates = (json: string) => {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) onChange(imported);
    } catch {}
  };

  // Timeline preview
  const safeValue = Array.isArray(value) ? value : [];
  const timeline = safeValue.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4">
      <Button type="button" onClick={() => setIsOpen(true)} variant="secondary">Manage Important Dates</Button>
      <Button type="button" onClick={exportDates} size="sm" variant="outline" className="ml-2"><Copy size={14} /> Export</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Important Dates</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {safeValue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50">
                <span style={{ color: item.color }}>
                  {typeOptions.find(t => t.value === item.type)?.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-gray-500">{item.date}</span>
                {item.isMilestone && <span className="text-xs text-green-600 ml-1">Milestone</span>}
                <Button type="button" size="icon" variant="ghost" title="Edit" onClick={() => openDialog(idx)}><Edit size={14} /></Button>
                <Button type="button" size="icon" variant="ghost" title="Delete" onClick={() => removeDate(idx)}><X size={14} /></Button>
                <span className="cursor-move ml-2" title="Drag to reorder" onMouseDown={() => moveDate(idx, Math.max(0, idx - 1))} onMouseUp={() => moveDate(idx, Math.min(value.length - 1, idx + 1))}>↕</span>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => openDialog()}><Plus size={14} /> Add Date</Button>
          </div>
          <div className="space-y-3 mt-4">
            <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Label (required)" />
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} placeholder="Date (required)" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ImportantDateType }))} className="w-full border rounded p-2">
              {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Input value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
            <Input value={form.tag || ""} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Tag (optional)" />
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={!!form.isMilestone} onChange={e => setForm(f => ({ ...f, isMilestone: e.target.checked }))} /> Milestone
            </label>
            <label className="flex items-center gap-2 mt-2">
              <span>Color:</span>
              <input type="color" value={form.color || "#1976d2"} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </label>
            <label className="flex items-center gap-2 mt-2">
              <span>Icon:</span>
              <select value={form.icon || "calendar"} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
                <option value="calendar">Calendar</option>
                <option value="flag">Flag</option>
                <option value="tag">Tag</option>
                <option value="edit">Edit</option>
              </select>
            </label>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveDate} disabled={!form.label.trim() || !form.date}>{editIdx !== null ? "Save" : "Add"}</Button>
          </DialogFooter>
          <div className="mt-6">
            <div className="font-semibold mb-2">Timeline Preview</div>
            <div className="flex flex-col gap-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span style={{ color: item.color }}>
                    {typeOptions.find(t => t.value === item.type)?.icon}
                  </span>
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                  {item.isMilestone && <span className="text-xs text-green-600 ml-1">Milestone</span>}
                  {item.tag && <span className="text-xs text-blue-600 ml-1">#{item.tag}</span>}
                  {item.description && <span className="text-xs text-gray-500 ml-2">{item.description}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <Input type="text" placeholder="Paste JSON to import" onBlur={e => importDates(e.target.value)} />
          </div>
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