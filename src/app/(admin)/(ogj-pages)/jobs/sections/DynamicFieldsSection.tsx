"use client";
// --- Utility: convert Lexical JSON -> HTML ---
export const convertLexicalJsonToHtml = (json: any): string => {
  try {
    if (!json) return "";
    if (typeof json === "object" && json.html && typeof json.html === "string") return json.html;
    const tryExtractText = (node: any): string => {
      if (node == null) return "";
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(tryExtractText).join("");
      if (typeof node === "object") {
        if (node.type === "text" && node.text) return node.text;
        if (node.children) return tryExtractText(node.children);
        if (node.value) return tryExtractText(node.value);
        return Object.values(node).map(tryExtractText).join("");
      }
      return "";
    };
    const txt = tryExtractText(json);
    return txt ? `<p>${txt.replace(/\n/g, "<br/>")}</p>` : "";
  } catch (e) {
    return "";
  }
};

type DynamicFieldValue = string | any[] | { json: any; html: string };
export type DynamicField = {
  label: string;
  type: "text" | "json" | "table" | "richtext";
  value?: DynamicFieldValue;
  meta?: Record<string, any>;
};

function EditorIsolated({ keyId, children }: { keyId: string; children: React.ReactNode }) {
  return <div key={keyId}>{children}</div>;
}

// Table/JSON helpers
const ensureMeta = (idx: number, dynamicFields: DynamicField[]) => dynamicFields[idx]?.meta ?? {};
const onJsonChange = (index: number, jsonVal: any, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  saveField(index, { value: jsonVal });
  setValue(`dynamicFields.${index}.value`, jsonVal, { shouldValidate: true });
};
const updateTableCell = (index: number, row: number, col: number, val: string, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
  table[row] = [...(table[row] || [])];
  table[row][col] = val;
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
};
const addTableRow = (index: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
  const cols = table[0]?.length || 1;
  table.push(Array(cols).fill(""));
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
};
const addTableCol = (index: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = Array.isArray(dynamicFields[index]?.value) ? (dynamicFields[index]!.value as any[]).map((r: any[]) => [...r, ""]) : [["", ""]];
  const meta = { ...(dynamicFields[index]?.meta || {}) };
  meta.columns = meta.columns ? [...meta.columns, `Col ${meta.columns.length + 1}`] : Array(table[0].length).fill("");
  saveField(index, { value: table, meta });
  setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldValidate: true });
};
const deleteTableRow = (index: number, row: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = Array.isArray(dynamicFields[index]?.value) ? [...(dynamicFields[index]!.value as any[])] : [[]];
  table.splice(row, 1);
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldValidate: true });
};
const reorderTableRows = (idx: number, from: number, to: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = Array.isArray(dynamicFields[idx]?.value) ? [...(dynamicFields[idx]!.value as any[])] : [];
  if (from < 0 || to < 0 || from >= table.length || to >= table.length) return;
  const item = table.splice(from, 1)[0];
  table.splice(to, 0, item);
  saveField(idx, { value: table });
  setValue(`dynamicFields.${idx}.value`, table, { shouldValidate: true });
};
const requestTypeChange = (idx: number, nextType: DynamicField['type'], dynamicFields: DynamicField[], setConfirmTypeChange: any) => {
  if (dynamicFields[idx]?.type === nextType) return;
  setConfirmTypeChange({ open: true, idx, nextType });
};
const performTypeChange = (confirmTypeChange: any, dynamicFields: DynamicField[], update: any, setConfirmTypeChange: any) => {
  const { idx, nextType } = confirmTypeChange;
  if (idx === null || idx === undefined || nextType === undefined) return setConfirmTypeChange({ open: false, idx: null });
  const current = dynamicFields[idx] || {};
  update(idx, { ...current, type: nextType });
  setConfirmTypeChange({ open: false, idx: null });
};
const openBulkEdit = (idx: number, dynamicFields: DynamicField[], setBulkEdit: any) => {
  const table = Array.isArray(dynamicFields[idx]?.value) ? (dynamicFields[idx]!.value as any[]) : [];
  const text = table.map((r: any[]) => r.map((c: any) => String(c ?? "")).join(",")).join("\n");
  setBulkEdit({ open: true, idx, text });
};
const applyBulkEdit = (bulkEdit: any, dynamicFields: DynamicField[], saveField: any, setValue: any, setBulkEdit: any) => {
  const idx = bulkEdit.idx;
  if (idx === null) return setBulkEdit({ open: false, idx: null, text: "" });
  const raw = bulkEdit.text || "";
  const rows = raw.split(/\r?\n/).map((r: any) => r.split(","));
  const normalized = rows.map((r: any) => r.map((c: any) => String(c ?? "").trim()));
  const meta = { ...(dynamicFields[idx]?.meta || {}) };
  meta.columns = meta.columns && meta.columns.length >= (normalized[0]?.length || 0)
    ? meta.columns.slice(0, normalized[0].length)
    : Array.from({ length: (normalized[0]?.length || 0) }, (_, i) => `Col ${i + 1}`);
  saveField(idx, { value: normalized, meta });
  setValue(`dynamicFields.${idx}.value`, normalized, { shouldValidate: true });
  setValue(`dynamicFields.${idx}.meta`, meta, { shouldValidate: true });
  setBulkEdit({ open: false, idx: null, text: "" });
};

// DynamicFieldsSection.tsx (refactor + features)


import React, { useState, useRef } from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import { JsonField } from "@/components/form/existing/JsonField";
import RichTextEditor from "@/components/form/existing/RichTextEditor";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/ui/dialog";
import { Card } from "@/components/shadcn/ui/card";
import { FieldCard } from "./FieldCard";

// ...existing code...


export default function DynamicFieldsSection() {
  // DnD for field reordering (HTML5 DnD)
  const dragStartIdx = useRef<number | null>(null);
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
  const { control, watch, setValue, getValues, formState } = useFormContext();
  const { fields, append, update, remove, move, insert } = useFieldArray({
    control,
    name: "dynamicFields",
  });

  const dynamicFields: DynamicField[] = watch("dynamicFields") || [];
  const errors = formState.errors?.dynamicFields || [];

  // dialog state: edit a specific field index
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // confirmation modal for type change
  const [confirmTypeChange, setConfirmTypeChange] = useState<{ open: boolean; idx: number | null; nextType?: DynamicField['type'] }>({ open: false, idx: null });

  // bulk edit modal
  const [bulkEdit, setBulkEdit] = useState<{ open: boolean; idx: number | null; text: string }>({ open: false, idx: null, text: "" });

  // preview modal
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  // search/filter/group
  const [search, setSearch] = useState("");
  const [groupByType, setGroupByType] = useState(false);

  // DnD drag index handled inside component

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

  // Duplicate field
  const duplicateField = (index: number) => {
    const field = dynamicFields[index];
    if (!field) return;
    insert(index + 1, { ...field, label: field.label + " (Copy)" });
  };

  // Preview field
  const openPreview = (index: number) => setPreviewIdx(index);
  const closePreview = () => setPreviewIdx(null);

  // Search/filter/group helpers
  const filteredFields = fields.filter((f, idx) => {
    if (!search) return true;
    const label = dynamicFields[idx]?.label?.toLowerCase() || "";
    return label.includes(search.toLowerCase());
  });

  const groupedFields = groupByType
    ? filteredFields.reduce((acc, f, idx) => {
        const type = dynamicFields[idx]?.type || "other";
        if (!acc[type]) acc[type] = [];
        acc[type].push({ f, idx });
        return acc;
      }, {} as Record<string, Array<{ f: typeof fields[0]; idx: number }>>)
    : null;

  // ...existing code...

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
        {groupByType && groupedFields
          ? Object.entries(groupedFields).map(([type, arr]) => (
              <div key={type} className="mb-4">
                <div className="font-semibold text-primary mb-2">{type.toUpperCase()}</div>
                <div className="space-y-2">
                  {arr.map(({ f, idx }) => (
                    <FieldCard
                      key={f.id}
                      idx={idx}
                      f={f}
                      dynamicFields={dynamicFields}
                      errors={errors}
                      openEditor={openEditor}
                      remove={remove}
                      duplicateField={duplicateField}
                      openPreview={openPreview}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  ))}
                </div>
              </div>
            ))
          : filteredFields.map((f, idx) => (
              <FieldCard
                key={f.id}
                idx={idx}
                f={f}
                dynamicFields={dynamicFields}
                errors={errors}
                openEditor={openEditor}
                remove={remove}
                duplicateField={duplicateField}
                openPreview={openPreview}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
              />
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
                        onChange={(e) => requestTypeChange(editIndex, e.target.value as DynamicField['type'], dynamicFields, setConfirmTypeChange)}
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
                      <JsonField value={field.value || []} onChange={(v) => { field.onChange(v); onJsonChange(editIndex, v, dynamicFields, saveField, setValue); }} />
                    </div>
                  )} />
                )}

                {dynamicFields[editIndex]?.type === "table" && (
                  <div className="space-y-2">
                    <div className="overflow-auto">
                      {/* Column headers */}
                      <div className="flex gap-2 items-center mb-2">
                        {(ensureMeta(editIndex, dynamicFields).columns || []).map((col: string, ci: number) => (
                          <div key={ci} className="text-xs border px-2 py-1 rounded">{col}</div>
                        ))}
                      </div>

                      <table className="border-collapse border w-full">
                        <tbody>
                          {(Array.isArray(dynamicFields[editIndex]?.value) ? dynamicFields[editIndex]?.value : []).map((row: any[] = [], r: number) => (
                            <tr key={r} draggable onDragStart={(e) => { e.dataTransfer.setData("row", String(r)); }} onDrop={(e) => { const from = parseInt(e.dataTransfer.getData("row") || "-1", 10); const to = r; if (from >= 0 && to >= 0 && from !== to) reorderTableRows(editIndex, from, to, dynamicFields, saveField, setValue); }} onDragOver={(e) => e.preventDefault()}>
                              {row.map((cell, c) => (
                                <td key={c} className="border p-1">
                                  <Input value={cell} onChange={(e) => updateTableCell(editIndex, r, c, e.target.value, dynamicFields, saveField, setValue)} />
                                </td>
                              ))}
                              <td className="border p-1">
                                <Button variant="destructive" type="button" onClick={() => deleteTableRow(editIndex, r, dynamicFields, saveField, setValue)}>Remove Row</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => addTableRow(editIndex, dynamicFields, saveField, setValue)}>+ Row</Button>
                      <Button onClick={() => addTableCol(editIndex, dynamicFields, saveField, setValue)}>+ Col</Button>
                      <Button onClick={() => openBulkEdit(editIndex, dynamicFields, setBulkEdit)}>Bulk Edit</Button>
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
            <Button onClick={() => performTypeChange(confirmTypeChange, dynamicFields, update, setConfirmTypeChange)}>Proceed</Button>
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
            <Button onClick={() => applyBulkEdit(bulkEdit, dynamicFields, saveField, setValue, setBulkEdit)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
