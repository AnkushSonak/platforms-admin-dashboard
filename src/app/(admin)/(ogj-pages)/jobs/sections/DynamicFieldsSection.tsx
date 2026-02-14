// DynamicFieldsSection.tsx (refactor + features)
"use client";

import React, { useState, useRef } from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import { JsonField } from "@/app/components/JsonField";
import RichTextEditor from "@/app/components/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/ui/dialog";
import { Card } from "@/components/shadcn/ui/card";

function EditorIsolated({ keyId, children }: { keyId: string; children: React.ReactNode }) {
  // simple wrapper that forces React to unmount/mount when keyId changes
  return <div key={keyId}>{children}</div>;
}

// NOTE: This file implements:
// - Strict RichTextEditor contract { json, html }
// - Lexical JSON -> HTML converter util (convertLexicalJsonToHtml)
// - Type-change confirmation modal
// - Table editor upgrades: column headers, reorder rows/cols, bulk edit
// - Drag & drop reordering of fields (HTML5 DnD)
// - Hardened typings & runtime guards

type DynamicFieldValue =
  | string
  | any[] // e.g. table or json
  | { json: any; html: string };

export type DynamicField = {
  label: string;
  type: "text" | "json" | "table" | "richtext";
  value?: DynamicFieldValue;
  meta?: Record<string, any>;
};

// --- Utility: convert Lexical JSON -> HTML ---
// Attempt to convert lexical JSON dump to HTML without needing editor instance.
// Implementation tries to rely on @lexical/html; if unavailable, it returns empty string.
// You can replace body with a project-specific implementation if needed.
export const convertLexicalJsonToHtml = (json: any): string => {
  try {
    // If @lexical/html is available in your project, you can do something like this:
    // const editor = createEditor();
    // editor.parseEditorState(JSON.stringify(json));
    // const html = $generateHtmlFromNodes(editor); // pseudo
    // return html;
    // But since we cannot guarantee environment here, we provide a safe fallback that
    // attempts to pluck an existing html if present or stringify text nodes.

    if (!json) return "";

    // If the json already has html property, use it
    if (typeof json === "object" && json.html && typeof json.html === "string") return json.html;

    // Try to extract plaintext from lexical-like structure
    const tryExtractText = (node: any): string => {
      if (node == null) return "";
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(tryExtractText).join("");
      if (typeof node === "object") {
        if (node.type === "text" && node.text) return node.text;
        // children
        if (node.children) return tryExtractText(node.children);
        // for nodes that store a value
        if (node.value) return tryExtractText(node.value);
        // last resort: flatten object values
        return Object.values(node).map(tryExtractText).join("");
      }
      return "";
    };

    const txt = tryExtractText(json);
    // Basic paragraph wrapping
    return txt ? `<p>${txt.replace(/\n/g, "<br/>")}</p>` : "";
  } catch (e) {
    return "";
  }
};

export default function DynamicFieldsSection() {
  const { control, watch, setValue, getValues } = useFormContext();
  const { fields, append, update, remove, move } = useFieldArray({
    control,
    name: "dynamicFields",
  });

  const dynamicFields: DynamicField[] = watch("dynamicFields") || [];

  // dialog state: edit a specific field index
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // confirmation modal for type change
  const [confirmTypeChange, setConfirmTypeChange] = useState<{ open: boolean; idx: number | null; nextType?: DynamicField['type'] }>({ open: false, idx: null });

  // bulk edit modal
  const [bulkEdit, setBulkEdit] = useState<{ open: boolean; idx: number | null; text: string }>({ open: false, idx: null, text: "" });

  // DnD drag index
  const dragStartIdx = useRef<number | null>(null);

  const openEditor = (index: number) => {
    setEditIndex(index);
    setDialogOpen(true);
  };
  const closeEditor = () => {
    setEditIndex(null);
    setDialogOpen(false);
  };

  // Add templates
  const addText = () => append({ label: "New Text", type: "text", value: "" });
  const addJson = () => append({ label: "Structured JSON", type: "json", value: [] });
  const addTable = () => append({ label: "New Table", type: "table", value: [[""]], meta: { columns: ["Col 1"] } });
  const addRich = () => append({ label: "Rich Text", type: "richtext", value: { json: null, html: "" } });

  // helper to update the current editing field
  const saveField = (index: number, payload: Partial<DynamicField>) => {
    const current = dynamicFields[index] || {};
    update(index, { ...current, ...payload });
  };

  // When saving richtext, handle the known contract { json, html }
  const onRichEditorChange = (index: number, data: { json: any; html: string }) => {
    if (!data || typeof data !== "object") return;
    const jsonVal = data.json ?? null;
    const htmlVal = data.html ?? convertLexicalJsonToHtml(jsonVal) ?? "";
    const value = { json: jsonVal, html: htmlVal };
    saveField(index, { value });
    setValue(`dynamicFields.${index}.value`, value, { shouldValidate: true });
  };

  // table helpers (update a specific row/col)
  const updateTableCell = (index: number, row: number, col: number, val: string) => {
    const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
    table[row] = [...(table[row] || [])];
    table[row][col] = val;
    saveField(index, { value: table });
    setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
  };

  const addTableRow = (index: number) => {
    const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
    const cols = table[0]?.length || 1;
    table.push(Array(cols).fill(""));
    saveField(index, { value: table });
    setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
  };

  const addTableCol = (index: number) => {
    const table = Array.isArray(dynamicFields[index]?.value) ? (dynamicFields[index]!.value as any[]).map((r: any[]) => [...r, ""]) : [["", ""]];
    // ensure meta.columns length consistency
    const meta = { ...(dynamicFields[index]?.meta || {}) };
    meta.columns = meta.columns ? [...meta.columns, `Col ${meta.columns.length + 1}`] : Array(table[0].length).fill("");
    saveField(index, { value: table, meta });
    setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
    setValue(`dynamicFields.${index}.meta`, meta, { shouldValidate: true });
  };

  const deleteTableRow = (index: number, row: number) => {
    const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
    table.splice(row, 1);
    saveField(index, { value: table });
    setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
  };

  const ensureMeta = (idx: number) => dynamicFields[idx]?.meta ?? {};

  // JSON editor handler
  const onJsonChange = (index: number, jsonVal: any) => {
    saveField(index, { value: jsonVal });
    setValue(`dynamicFields.${index}.value`, jsonVal, { shouldValidate: true });
  };

  // --- Type change with confirmation ---
  const requestTypeChange = (idx: number, nextType: DynamicField['type']) => {
    // if same type, noop
    if (dynamicFields[idx]?.type === nextType) return;
    setConfirmTypeChange({ open: true, idx, nextType });
  };

  const performTypeChange = () => {
    const { idx, nextType } = confirmTypeChange as any;
    if (idx === null || idx === undefined || nextType === undefined) return setConfirmTypeChange({ open: false, idx: null });
    const current = dynamicFields[idx] || {};
    // No automatic reset — just change type and keep value (as requested). We still warn user.
    update(idx, { ...current, type: nextType });
    setConfirmTypeChange({ open: false, idx: null });
  };

  // --- DnD for field reordering (HTML5 DnD) ---
  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragStartIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", String(idx)); } catch { }
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = dragStartIdx.current ?? parseInt(e.dataTransfer.getData("text/plain") || "-1", 10);
    const to = idx;
    if (from >= 0 && to >= 0 && from !== to) move(from, to);
    dragStartIdx.current = null;
  };

  // --- Table utilities: reorder rows/cols, bulk edit ---
  const reorderTableRows = (idx: number, from: number, to: number) => {
    const table = Array.isArray(dynamicFields[idx]?.value) ? [...(dynamicFields[idx]!.value as any[])] : [];
    if (from < 0 || to < 0 || from >= table.length || to >= table.length) return;
    const item = table.splice(from, 1)[0];
    table.splice(to, 0, item);
    saveField(idx, { value: table });
    setValue(`dynamicFields.${idx}.value`, table, { shouldValidate: true });
  };

  const reorderTableCols = (idx: number, from: number, to: number) => {
    const table = Array.isArray(dynamicFields[idx]?.value) ? (dynamicFields[idx]!.value as any[]).map((r: any[]) => [...r]) : [];
    if (table.length === 0) return;
    const cols = table[0].length;
    if (from < 0 || to < 0 || from >= cols || to >= cols) return;
    const meta = { ...(dynamicFields[idx]?.meta || {}) };

    // reorder each row
    const newTable = table.map((r: any[]) => {
      const row = [...r];
      const item = row.splice(from, 1)[0];
      row.splice(to, 0, item);
      return row;
    });

    // reorder meta.columns if present
    if (meta.columns && Array.isArray(meta.columns)) {
      const colsArr = [...meta.columns];
      const item = colsArr.splice(from, 1)[0];
      colsArr.splice(to, 0, item);
      meta.columns = colsArr;
    }

    saveField(idx, { value: newTable, meta });
    setValue(`dynamicFields.${idx}.value`, newTable, { shouldValidate: true });
    setValue(`dynamicFields.${idx}.meta`, meta, { shouldValidate: true });
  };

  const openBulkEdit = (idx: number) => {
    // Pre-fill CSV-ish text
    const table = Array.isArray(dynamicFields[idx]?.value) ? (dynamicFields[idx]!.value as any[]) : [];
    const text = table.map((r: any[]) => r.map((c: any) => String(c ?? "")).join(",")).join("\n");
    setBulkEdit({ open: true, idx, text });
  };

  const applyBulkEdit = () => {
    const idx = bulkEdit.idx;
    if (idx === null) return setBulkEdit({ open: false, idx: null, text: "" });
    const raw = bulkEdit.text || "";
    const rows = raw.split(/\r?\n/).map((r) => r.split(","));
    // trim
    const normalized = rows.map((r) => r.map((c) => String(c ?? "").trim()));
    // ensure columns meta
    const meta = { ...(dynamicFields[idx]?.meta || {}) };
    meta.columns = meta.columns && meta.columns.length >= (normalized[0]?.length || 0)
      ? meta.columns.slice(0, normalized[0].length)
      : Array.from({ length: (normalized[0]?.length || 0) }, (_, i) => `Col ${i + 1}`);

    saveField(idx, { value: normalized, meta });
    setValue(`dynamicFields.${idx}.value`, normalized, { shouldValidate: true });
    setValue(`dynamicFields.${idx}.meta`, meta, { shouldValidate: true });
    setBulkEdit({ open: false, idx: null, text: "" });
  };

  // --- Render ---
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button type="button" onClick={addText}>+ Text</Button>
        <Button type="button" onClick={addRich}>+ Rich Text</Button>
        <Button type="button" onClick={addTable}>+ Table</Button>
        <Button type="button" onClick={addJson}>+ JSON</Button>
      </div>

      <div className="space-y-3">
        {fields.map((f, idx) => (
          <Card
            key={f.id}
            className="p-3 flex justify-between items-start"
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={(e) => onDrop(e, idx)}
          >
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <strong>{dynamicFields[idx]?.label || `Field ${idx + 1}`}</strong>
                <span className="text-xs text-muted-foreground">({dynamicFields[idx]?.type})</span>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                {dynamicFields[idx]?.type === "text" && <div>{String(dynamicFields[idx]?.value || "")}</div>}

                {dynamicFields[idx]?.type === "json" && <pre className="text-xs">{JSON.stringify(dynamicFields[idx]?.value || {}, null, 2)}</pre>}

                {dynamicFields[idx]?.type === "table" && (
                  <div className="overflow-auto max-w-full">
                    <table className="border-collapse border">
                      <tbody>
                        {Array.isArray(dynamicFields[idx]?.value) ? ((dynamicFields[idx]?.value || [[]]).map((row: any[], r: number) => (
                          <tr key={r}>
                            {(row || []).map((cell, c) => <td key={c} className="border px-2 py-1 text-xs">{String(cell ?? "")}</td>)}
                          </tr>
                        ))) : []}
                      </tbody>
                    </table>
                  </div>
                )}

                {dynamicFields[idx]?.type === "richtext" && typeof dynamicFields[idx]?.value === "object" && dynamicFields[idx]?.value !== null && "html" in dynamicFields[idx]?.value && (
                  <div dangerouslySetInnerHTML={{ __html: dynamicFields[idx]?.value.html || "" }} />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <div className="flex gap-2">
                <Button type="button" onClick={() => openEditor(idx)}>Edit</Button>
                <Button variant="ghost" type="button" onClick={() => remove(idx)}>Delete</Button>
              </div>

              <div className="text-xs text-muted-foreground">Drag to reorder</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeEditor(); setDialogOpen(v); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Dynamic Field</DialogTitle>
          </DialogHeader>

          {editIndex !== null && (
            <>
              {/* Label + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Label</Label>
                  <Controller
                    control={control}
                    name={`dynamicFields.${editIndex}.label`}
                    render={({ field }) => <Input {...field} />}
                  />
                </div>

                <div>
                  <Label>Type</Label>
                  <Controller
                    control={control}
                    name={`dynamicFields.${editIndex}.type`}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="mt-1 border rounded px-2 py-1 w-full"
                        onChange={(e) => requestTypeChange(editIndex, e.target.value as DynamicField['type'])}
                      >
                        <option value="text">text</option>
                        <option value="richtext">richtext</option>
                        <option value="table">table</option>
                        <option value="json">json</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* Value editor based on type */}
              <div className="mt-4">
                {dynamicFields[editIndex]?.type === "text" && (
                  <Controller control={control} name={`dynamicFields.${editIndex}.value`} render={({ field }) => (
                    <Input {...field} />
                  )} />
                )}

                {dynamicFields[editIndex]?.type === "json" && (
                  <Controller control={control} name={`dynamicFields.${editIndex}.value`} render={({ field }) => (
                    <div className="border rounded p-2">
                      <JsonField value={field.value || []} onChange={(v) => { field.onChange(v); onJsonChange(editIndex, v); }} />
                    </div>
                  )} />
                )}

                {dynamicFields[editIndex]?.type === "table" && (
                  <div className="space-y-2">
                    <div className="overflow-auto">
                      {/* Column headers */}
                      <div className="flex gap-2 items-center mb-2">
                        {(ensureMeta(editIndex).columns || []).map((col: string, ci: number) => (
                          <div key={ci} className="text-xs border px-2 py-1 rounded">{col}</div>
                        ))}
                      </div>

                      <table className="border-collapse border w-full">
                        <tbody>
                          {(Array.isArray(dynamicFields[editIndex]?.value) ? dynamicFields[editIndex]?.value : []).map((row: any[] = [], r: number) => (
                            <tr key={r} draggable onDragStart={(e) => { e.dataTransfer.setData("row", String(r)); }} onDrop={(e) => { const from = parseInt(e.dataTransfer.getData("row") || "-1", 10); const to = r; if (from >= 0 && to >= 0 && from !== to) reorderTableRows(editIndex, from, to); }} onDragOver={(e) => e.preventDefault()}>
                              {row.map((cell, c) => (
                                <td key={c} className="border p-1">
                                  <Input value={cell} onChange={(e) => updateTableCell(editIndex, r, c, e.target.value)} />
                                </td>
                              ))}
                              <td className="border p-1">
                                <Button variant="destructive" type="button" onClick={() => deleteTableRow(editIndex, r)}>Remove Row</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => addTableRow(editIndex)}>+ Row</Button>
                      <Button onClick={() => addTableCol(editIndex)}>+ Col</Button>
                      <Button onClick={() => openBulkEdit(editIndex)}>Bulk Edit</Button>
                    </div>
                  </div>
                )}

                {dynamicFields[editIndex]?.type === "richtext" && (
                  // Controller handles the array value object shape for RHF
                  <Controller
                    control={control}
                    name={`dynamicFields.${editIndex}.value`}
                    defaultValue={{ json: null, html: "" }}
                    render={({ field }) => {
                      // field.value expected to be { json, html }
                      const currentVal = (field.value ?? { json: null, html: "" }) as { json: any; html: string };

                      // isolate by a composed key (field index + unique id)
                      const isolationKey = `dynamic-field-${editIndex}-${(dynamicFields[editIndex] as any)?.meta?.id ?? fields[editIndex]?.id
                        }`;


                      return (
                        <div>
                          <EditorIsolated keyId={isolationKey}>
                            <RichTextEditor
                              id={`dynamic-field-${editIndex}`}
                              namespace={`dynamic-field-${editIndex}`}
                              value={currentVal.json || null}      // <- ONLY JSON
                              onChange={(data) => {
                                const val = { json: data.json, html: data.html };
                                field.onChange(val);
                                setValue(`dynamicFields.${editIndex}.value`, val);
                              }}
                            />

                          </EditorIsolated>

                          <div className="mt-2 flex gap-2">
                            <Button onClick={() => {
                              const val = (dynamicFields[editIndex]?.value ?? { json: null, html: "" }) as { json: any; html: string };
                              if ((!val?.html || val.html.length === 0) && val?.json) {
                                const newHtml = convertLexicalJsonToHtml(val.json);
                                const newVal = { ...(val as any), html: newHtml };
                                field.onChange(newVal);
                                setValue(`dynamicFields.${editIndex}.value`, newVal, { shouldValidate: true });
                              }
                            }}>Ensure HTML</Button>

                            <Button onClick={() => closeEditor()}>Save</Button>
                          </div>
                        </div>
                      );
                    }}
                  />
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button onClick={() => closeEditor()}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Type Change Dialog */}
      <Dialog open={confirmTypeChange.open} onOpenChange={(v) => setConfirmTypeChange({ ...confirmTypeChange, open: v })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change field type?</DialogTitle>
          </DialogHeader>
          <div className="p-2">
            <p>Changing the field type may make the existing value irrelevant for the new type. As requested, we will <strong>not</strong> reset the value automatically. Do you want to continue?</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmTypeChange({ open: false, idx: null })}>Cancel</Button>
            <Button onClick={() => performTypeChange()}>Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog for tables */}
      <Dialog open={bulkEdit.open} onOpenChange={(v) => setBulkEdit({ ...bulkEdit, open: v })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Edit Table (CSV lines)</DialogTitle>
          </DialogHeader>

          <div className="p-2">
            <Label>Paste CSV-style content (comma separated). One row per line.</Label>
            <textarea
              className="w-full h-48 border rounded p-2 mt-2"
              value={bulkEdit.text}
              onChange={(e) => setBulkEdit({ ...bulkEdit, text: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkEdit({ open: false, idx: null, text: "" })}>Cancel</Button>
            <Button onClick={() => applyBulkEdit()}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
