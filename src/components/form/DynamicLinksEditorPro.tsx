import React, { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/ui/dialog";
import { X, Plus, ExternalLink, Copy, FileText, Video, Globe } from "lucide-react";

export type LinkType = "website" | "pdf" | "video" | "other";
export type LinkItem = {
  title: string;
  url: string;
  type: LinkType;
  description?: string;
};
export type LinkGroup = {
  label: string;
  links: LinkItem[];
};

interface Props {
  value: LinkGroup[];
  onChange: (value: LinkGroup[]) => void;
}

const typeIcons: Record<LinkType, React.ReactNode> = {
  website: <Globe size={16} />,
  pdf: <FileText size={16} />,
  video: <Video size={16} />,
  other: <FileText size={16} />,
};

export function DynamicLinksEditorPro({ value = [], onChange }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGroupIdx, setEditGroupIdx] = useState<number | null>(null);
  const [editLinkIdx, setEditLinkIdx] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState<LinkItem>({ title: "", url: "", type: "website", description: "" });
  const [groupForm, setGroupForm] = useState<string>("");

  // Drag-and-drop reordering (simple version)
  const moveLink = (groupIdx: number, from: number, to: number) => {
    if (from === to) return;
    const next = [...value];
    const links = [...next[groupIdx].links];
    const [moved] = links.splice(from, 1);
    links.splice(to, 0, moved);
    next[groupIdx].links = links;
    onChange(next);
  };

  // Add/edit link dialog
  const openLinkDialog = (groupIdx: number, linkIdx?: number) => {
    setEditGroupIdx(groupIdx);
    setEditLinkIdx(linkIdx ?? null);
    if (linkIdx !== undefined && linkIdx !== null) {
      setLinkForm({ ...value[groupIdx].links[linkIdx] });
    } else {
      setLinkForm({ title: "", url: "", type: "website", description: "" });
    }
    setDialogOpen(true);
  };
  const saveLink = () => {
    if (!linkForm.title.trim() || !/^https?:\/\/.+/.test(linkForm.url)) return;
    const next = [...value];
    if (editLinkIdx !== null && editLinkIdx !== undefined) {
      next[editGroupIdx!].links[editLinkIdx] = { ...linkForm };
    } else {
      next[editGroupIdx!].links.push({ ...linkForm });
    }
    onChange(next);
    setDialogOpen(false);
  };

  // Add/remove group
  const addGroup = () => {
    if (!groupForm.trim()) return;
    onChange([...value, { label: groupForm, links: [] }]);
    setGroupForm("");
  };
  const removeGroup = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  // Remove link
  const removeLink = (groupIdx: number, linkIdx: number) => {
    const next = [...value];
    next[groupIdx].links = next[groupIdx].links.filter((_, i) => i !== linkIdx);
    onChange(next);
  };

  // Bulk import/export
  const exportLinks = () => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };
  const importLinks = (json: string) => {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) onChange(imported);
    } catch {}
  };

  // UI
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Input value={groupForm} onChange={e => setGroupForm(e.target.value)} placeholder="New group label" />
        <Button type="button" onClick={addGroup} size="sm" variant="secondary"><Plus size={14} /> Add Group</Button>
        <Button type="button" onClick={exportLinks} size="sm" variant="outline"><Copy size={14} /> Export</Button>
      </div>
      <div className="space-y-4">
        {value.map((group, groupIdx) => (
          <div key={groupIdx} className="border rounded p-4 space-y-3 relative">
            <button type="button" onClick={() => removeGroup(groupIdx)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><X size={14} /></button>
            <div className="font-semibold mb-2">{group.label}</div>
            <div className="space-y-2">
              {group.links.map((link, linkIdx) => (
                <div key={linkIdx} className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50">
                  <span>{typeIcons[link.type]}</span>
                  <span className="font-medium">{link.title}</span>
                  <Button type="button" size="icon" variant="ghost" title="Open" onClick={() => window.open(link.url, "_blank")}> <ExternalLink size={14} /> </Button>
                  <Button type="button" size="icon" variant="ghost" title="Copy" onClick={() => navigator.clipboard.writeText(link.url)}> <Copy size={14} /> </Button>
                  <Button type="button" size="icon" variant="ghost" title="Edit" onClick={() => openLinkDialog(groupIdx, linkIdx)}> <Plus size={14} /> </Button>
                  <Button type="button" size="icon" variant="ghost" title="Delete" onClick={() => removeLink(groupIdx, linkIdx)}> <X size={14} /> </Button>
                  {link.description && <span className="text-xs text-gray-500 ml-2">{link.description}</span>}
                  <span className="cursor-move ml-2" title="Drag to reorder" onMouseDown={() => moveLink(groupIdx, linkIdx, Math.max(0, linkIdx - 1))} onMouseUp={() => moveLink(groupIdx, linkIdx, Math.min(group.links.length - 1, linkIdx + 1))}>↕</span>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => openLinkDialog(groupIdx)}><Plus size={14} /> Add Link</Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editLinkIdx !== null ? "Edit Link" : "Add Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} placeholder="Title (required)" />
            <Input value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="URL (required, must start with http/https)" />
            <select value={linkForm.type} onChange={e => setLinkForm(f => ({ ...f, type: e.target.value as LinkType }))} className="w-full border rounded p-2">
              <option value="website">Website</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
            <Input value={linkForm.description || ""} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveLink} disabled={!linkForm.title.trim() || !/^https?:\/\/.+/.test(linkForm.url)}>{editLinkIdx !== null ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="mt-2">
        <Input type="text" placeholder="Paste JSON to import" onBlur={e => importLinks(e.target.value)} />
      </div>
    </div>
  );
}


//TODO: Future Enhancements

// Advanced UX/UI Improvements
// Favicon Preview: Fetch and display website favicons for URLs.
// Link Validation Feedback: Show inline error messages for invalid URLs or missing titles.
// Undo/Redo Support: Allow users to revert accidental changes.
// Accessibility: Ensure keyboard navigation, ARIA labels, and screen reader support.
// Multi-language Support: Allow link titles/descriptions in multiple languages.
// Bulk Actions: Select multiple links/groups for batch delete or type change.
// Advanced Drag-and-Drop: Use libraries for smooth, animated reordering.
// File Uploads: Allow uploading PDFs/videos directly, storing links to uploaded files.
// Audit Trail: Track who added/edited each link (for admin).
// Link Expiry/Activation: Set active/inactive dates for links.
// Tagging/Categorization: Add tags to links for filtering/search.
// Search/Filter: Quickly find links by title, type, or tag.
// Analytics: Track link clicks or usage stats (if needed).

// Backend/Integration
// Server-side Validation: Validate links/types on backend for security.
// Versioning: Keep history of changes for rollback.
// Integration with External APIs: Auto-fetch metadata (title, description) from URLs.

// Security
// Sanitize URLs: Prevent XSS or malicious links.
// Permission Controls: Restrict who can edit/delete links.