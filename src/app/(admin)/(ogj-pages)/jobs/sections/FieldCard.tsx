import React, { JSX } from "react";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";

const typeIcons: Record<string, JSX.Element> = {
  text: <span title="Text field" className="mr-1">📝</span>,
  richtext: <span title="Rich text editor" className="mr-1">🖋️</span>,
  table: <span title="Table field" className="mr-1">📊</span>,
  json: <span title="JSON field" className="mr-1">🗄️</span>,
};

import type { DynamicField } from "./DynamicFieldsSection";

interface FieldCardProps {
  idx: number;
  f: any;
  dynamicFields: DynamicField[];
  errors: any;
  openEditor: (idx: number) => void;
  remove: (idx: number) => void;
  duplicateField: (idx: number) => void;
  openPreview: (idx: number) => void;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
}

export function FieldCard({ idx, f, dynamicFields, errors, openEditor, remove, duplicateField, openPreview, onDragStart, onDragOver, onDrop }: FieldCardProps) {
  const error = errors?.[idx];
  return (
    <Card
      key={f.id}
      className={`p-4 flex justify-between items-center group transition-shadow duration-150 border border-muted hover:shadow-lg hover:border-primary relative ${error ? "border-destructive" : ""}`}
      draggable
      onDragStart={e => onDragStart(e, idx)}
      onDragOver={e => onDragOver(e, idx)}
      onDrop={e => onDrop(e, idx)}
      style={{ cursor: "grab" }}
    >
      {/* Drag handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center opacity-60 group-hover:opacity-100 transition-opacity cursor-grab" title="Drag to reorder">
        <span style={{ fontSize: "1.3em" }}>⠿</span>
      </div>

      <div className="flex-1 pl-8">
        <div className="flex gap-2 items-center">
          {typeIcons[dynamicFields[idx]?.type ?? "text"]}
          <strong>{dynamicFields[idx]?.label || `Field ${idx + 1}`}</strong>
          <span className="text-xs text-muted-foreground" title={`Type: ${dynamicFields[idx]?.type}`}>({dynamicFields[idx]?.type})</span>
        </div>
        {error && <div className="text-xs text-destructive mt-1">{error.message || "Invalid value"}</div>}
        <div className="mt-2 text-sm text-muted-foreground">
          {dynamicFields[idx]?.type === "text" && <div title="Text value">{String(dynamicFields[idx]?.value || "")}</div>}
          {dynamicFields[idx]?.type === "json" && <pre className="text-xs" title="JSON value">{JSON.stringify(dynamicFields[idx]?.value || {}, null, 2)}</pre>}
          {dynamicFields[idx]?.type === "table" && (
            <div className="overflow-auto max-w-full" title="Table value">
              <table className="border-collapse border">
                <tbody>
                  {Array.isArray(dynamicFields[idx]?.value) ? ((dynamicFields[idx]?.value || [[]]).map((row: any[], r: number) => (
                    <tr key={r}>
                      {(row || []).map((cell, c) => <td key={c} className="border px-2 py-1 text-xs">{String(cell)}</td>)}
                    </tr>
                  ))) : []}
                </tbody>
              </table>
            </div>
          )}
          {dynamicFields[idx]?.type === "richtext" && typeof dynamicFields[idx]?.value === "object" && dynamicFields[idx]?.value !== null && "html" in dynamicFields[idx]?.value && (
            <div dangerouslySetInnerHTML={{ __html: dynamicFields[idx]?.value.html || "" }} title="Rich text value" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 ml-4 items-end">
        <div className="flex gap-2">
          <Button type="button" onClick={() => openEditor(idx)} title="Edit field">✏️ Edit</Button>
          <Button variant="ghost" type="button" onClick={() => remove(idx)} title="Delete field">🗑️ Delete</Button>
          <Button variant="outline" type="button" onClick={() => duplicateField(idx)} title="Duplicate field">⧉ Duplicate</Button>
          <Button variant="secondary" type="button" onClick={() => openPreview(idx)} title="Preview field">👁️ Preview</Button>
        </div>
      </div>
    </Card>
  );
}
