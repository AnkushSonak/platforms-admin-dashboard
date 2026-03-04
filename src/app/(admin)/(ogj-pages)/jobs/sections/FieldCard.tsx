import React, { JSX } from "react";
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Copy, Eye, GripVertical, Pencil, Trash2 } from "lucide-react";

const typeIcons: Record<string, JSX.Element> = {
  text: <span title="Text field" className="mr-1">TXT</span>,
  richtext: <span title="Rich text editor" className="mr-1">RT</span>,
  table: <span title="Table field" className="mr-1">TBL</span>,
  json: <span title="JSON field" className="mr-1">JSON</span>,
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

export function FieldCard({
  idx,
  f,
  dynamicFields,
  errors,
  openEditor,
  remove,
  duplicateField,
  openPreview,
  onDragStart,
  onDragOver,
  onDrop,
}: FieldCardProps) {
  const error = errors?.[idx];
  const field = dynamicFields[idx];
  const type = field?.type ?? "text";
  const tableMatrix = React.useMemo(() => {
    if (!Array.isArray(field?.value)) return [] as string[][];
    const raw = field.value as unknown[];
    if (raw.length === 0) return [] as string[][];

    if (raw.every((row) => Array.isArray(row))) {
      return (raw as unknown[][]).map((row) => row.map((cell) => String(cell ?? "")));
    }

    if (raw.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
      const objectRows = raw as Record<string, unknown>[];
      const keys = Array.from(new Set(objectRows.flatMap((row) => Object.keys(row))));
      return objectRows.map((row) => keys.map((key) => String(row[key] ?? "")));
    }

    return raw.map((cell) => [String(cell ?? "")]);
  }, [field?.value]);

  const tableRows = tableMatrix.length;
  const tableCols = tableMatrix[0]?.length ?? 0;

  return (
    <Card
      key={f.id}
      className={`p-4 flex justify-between items-start gap-3 group transition-shadow duration-150 border border-muted hover:shadow-lg hover:border-primary relative ${
        error ? "border-destructive" : ""
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDrop={(e) => onDrop(e, idx)}
      style={{ cursor: "grab" }}
    >
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center opacity-60 group-hover:opacity-100 transition-opacity cursor-grab"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-1 pl-8">
        <div className="flex gap-2 items-center flex-wrap">
          <Badge variant="secondary" className="font-mono text-[10px]">
            {typeIcons[type]} {type}
          </Badge>
          <strong>{field?.label || `Field ${idx + 1}`}</strong>
          <span className="text-xs text-muted-foreground">#{idx + 1}</span>
          {type === "table" && (
            <span className="text-xs text-muted-foreground">
              {tableRows}r x {tableCols}c
            </span>
          )}
        </div>

        {error && <div className="text-xs text-destructive mt-1">{error.message || "Invalid value"}</div>}

        <div className="mt-2 text-sm text-muted-foreground max-h-24 overflow-auto">
          {type === "text" && <div title="Text value">{String(field?.value || "")}</div>}

          {type === "json" && <pre className="text-xs" title="JSON value">{JSON.stringify(field?.value || {}, null, 2)}</pre>}

          {type === "table" && (
            <div className="overflow-auto max-w-full" title="Table value">
              <table className="border-collapse border">
                <tbody>
                  {tableMatrix.length
                    ? tableMatrix.slice(0, 3).map((row: string[], r: number) => (
                        <tr key={r}>
                          {row.map((cell, c) => (
                            <td key={c} className="border px-2 py-1 text-xs">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))
                    : []}
                </tbody>
              </table>
            </div>
          )}

          {type === "richtext" &&
            typeof field?.value === "object" &&
            field?.value !== null &&
            "html" in field.value && (
              <div dangerouslySetInnerHTML={{ __html: field.value.html || "" }} title="Rich text value" />
            )}
        </div>
      </div>

      <div className="flex flex-col gap-2 ml-4 items-end">
        <div className="flex gap-1 flex-wrap justify-end">
          <Button size="sm" type="button" onClick={() => openEditor(idx)} title="Edit field">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="outline" type="button" onClick={() => duplicateField(idx)} title="Duplicate field">
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
          </Button>
          <Button size="sm" variant="secondary" type="button" onClick={() => openPreview(idx)} title="Preview field">
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="text-destructive"
            onClick={() => remove(idx)}
            title="Delete field"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
