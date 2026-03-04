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

function normalizeTableValue(value: unknown): string[][] {
  if (!Array.isArray(value) || value.length === 0) return [[""]];

  // Handle legacy/object rows: [{a:1,b:2}, ...]
  if (value.every((row) => row && typeof row === "object" && !Array.isArray(row))) {
    const objectRows = value as Record<string, unknown>[];
    const keys = Array.from(
      new Set(objectRows.flatMap((row) => Object.keys(row)))
    );
    if (keys.length === 0) return [[""]];
    return objectRows.map((row) => keys.map((k) => String(row[k] ?? "")));
  }

  // Handle primitive rows: ["a","b"]
  if (value.every((row) => !Array.isArray(row))) {
    return (value as unknown[]).map((cell) => [String(cell ?? "")]);
  }

  return (value as unknown[]).map((row) => {
    if (Array.isArray(row)) return row.map((cell) => String(cell ?? ""));
    return [String(row ?? "")];
  });
}

// Table/JSON helpers
const ensureMeta = (idx: number, dynamicFields: DynamicField[]) => dynamicFields[idx]?.meta ?? {};
const onJsonChange = (index: number, jsonVal: any, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  saveField(index, { value: jsonVal });
  setValue(`dynamicFields.${index}.value`, jsonVal, { shouldDirty: true });
};
const updateTableCell = (index: number, row: number, col: number, val: string, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  table[row] = [...(table[row] || [])];
  table[row][col] = val;
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldDirty: true });
};
const syncTableColumns = (index: number, table: string[][], dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const safeTable = normalizeTableValue(table);
  const lengths = safeTable.map((row) => row.length).filter((n) => Number.isFinite(n) && n > 0);
  const colCount = Math.max(1, ...(lengths.length ? lengths : [1]));
  const meta = { ...(dynamicFields[index]?.meta || {}) };
  const existingColumns: string[] = Array.isArray(meta.columns) ? meta.columns : [];
  meta.columns = Array.from({ length: colCount }, (_, colIdx) => existingColumns[colIdx] || `Col ${colIdx + 1}`);
  const normalized = safeTable.map((row) => {
    const rowCopy = [...row];
    if (rowCopy.length < colCount) {
      rowCopy.push(...Array(colCount - rowCopy.length).fill(""));
    }
    return rowCopy.slice(0, colCount);
  });

  saveField(index, { value: normalized, meta });
  setValue(`dynamicFields.${index}.value`, normalized, { shouldDirty: true });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldDirty: true });
};
const addTableRow = (index: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  const cols = table[0]?.length || 1;
  table.push(Array(cols).fill(""));
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldDirty: true });
};
const addTableCol = (index: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r, ""]);
  const meta = { ...(dynamicFields[index]?.meta || {}) };
  meta.columns = meta.columns ? [...meta.columns, `Col ${meta.columns.length + 1}`] : Array(table[0].length).fill("");
  saveField(index, { value: table, meta });
  setValue(`dynamicFields.${index}.value`, table, { shouldDirty: true });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldDirty: true });
};
const removeTableCol = (index: number, col: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  if (!table[0] || table[0].length <= 1) return;
  const nextTable = table.map((row: any[]) => {
    const rowCopy = [...row];
    rowCopy.splice(col, 1);
    return rowCopy;
  });
  const meta = { ...(dynamicFields[index]?.meta || {}) };
  if (Array.isArray(meta.columns)) {
    meta.columns = [...meta.columns];
    meta.columns.splice(col, 1);
  }
  saveField(index, { value: nextTable, meta });
  setValue(`dynamicFields.${index}.value`, nextTable, { shouldDirty: true });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldDirty: true });
};
const renameTableCol = (index: number, col: number, value: string, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const meta = { ...(dynamicFields[index]?.meta || {}) };
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  meta.columns = Array.isArray(meta.columns) ? [...meta.columns] : Array(Math.max(1, table[0]?.length || 1)).fill("");
  meta.columns[col] = value;
  saveField(index, { meta });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldDirty: true });
};
const moveTableCol = (index: number, col: number, direction: "left" | "right", dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  const colCount = table[0]?.length || 0;
  const to = direction === "left" ? col - 1 : col + 1;
  if (col < 0 || to < 0 || col >= colCount || to >= colCount) return;

  const nextTable = table.map((row: any[]) => {
    const rowCopy = [...row];
    [rowCopy[col], rowCopy[to]] = [rowCopy[to], rowCopy[col]];
    return rowCopy;
  });

  const meta = { ...(dynamicFields[index]?.meta || {}) };
  if (Array.isArray(meta.columns)) {
    meta.columns = [...meta.columns];
    [meta.columns[col], meta.columns[to]] = [meta.columns[to], meta.columns[col]];
  }

  saveField(index, { value: nextTable, meta });
  setValue(`dynamicFields.${index}.value`, nextTable, { shouldDirty: true });
  setValue(`dynamicFields.${index}.meta`, meta, { shouldDirty: true });
};
const deleteTableRow = (index: number, row: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  table.splice(row, 1);
  const safeTable = table.length ? table : [Array(Math.max(1, table[0]?.length || 1)).fill("")];
  saveField(index, { value: safeTable });
  setValue(`dynamicFields.${index}.value`, safeTable, { shouldDirty: true });
};
const duplicateTableRow = (index: number, row: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[index]?.value).map((r) => [...r]);
  const rowCopy = [...(table[row] || [])];
  table.splice(row + 1, 0, rowCopy);
  saveField(index, { value: table });
  setValue(`dynamicFields.${index}.value`, table, { shouldDirty: true });
};
const reorderTableRows = (idx: number, from: number, to: number, dynamicFields: DynamicField[], saveField: any, setValue: any) => {
  const table = normalizeTableValue(dynamicFields[idx]?.value).map((r) => [...r]);
  if (from < 0 || to < 0 || from >= table.length || to >= table.length) return;
  const item = table.splice(from, 1)[0];
  table.splice(to, 0, item);
  saveField(idx, { value: table });
  setValue(`dynamicFields.${idx}.value`, table, { shouldDirty: true });
};
const tableToCsv = (table: string[][]) =>
  table
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        })
        .join(",")
    )
    .join("\n");
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
  setValue(`dynamicFields.${idx}.value`, normalized, { shouldDirty: true });
  setValue(`dynamicFields.${idx}.meta`, meta, { shouldDirty: true });
  setBulkEdit({ open: false, idx: null, text: "" });
};

// DynamicFieldsSection.tsx (refactor + features)


import React, { useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Button } from "@/components/shadcn/ui/button";
import { JsonField } from "@/components/form/existing/JsonField";
import RichTextEditor from "@/components/form/existing/RichTextEditor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { Card } from "@/components/shadcn/ui/card";
import { Badge } from "@/components/shadcn/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/ui/dropdown-menu";
import { Copy, Download, Filter, LayoutGrid, ListFilter, Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { FieldCard } from "./FieldCard";

// ...existing code...

type DynamicTableEditorProps = {
  editIndex: number;
  dynamicFields: DynamicField[];
  saveField: (index: number, payload: Partial<DynamicField>) => void;
  setValue: any;
  tableSearch: string;
  setTableSearch: (value: string) => void;
  setBulkEdit: React.Dispatch<React.SetStateAction<{ open: boolean; idx: number | null; text: string }>>;
};

function DynamicTableEditor({
  editIndex,
  dynamicFields,
  saveField,
  setValue,
  tableSearch,
  setTableSearch,
  setBulkEdit,
}: DynamicTableEditorProps) {
  const [sortState, setSortState] = useState<{ col: number | null; dir: "asc" | "desc" | null }>({
    col: null,
    dir: null,
  });

  const rawTable = normalizeTableValue(dynamicFields[editIndex]?.value);
  const lengths = rawTable.map((row) => row.length).filter((n) => Number.isFinite(n) && n > 0);
  const colCount = Math.max(1, ...(lengths.length ? lengths : [1]));
  const columnsMeta = Array.from({ length: colCount }, (_, colIdx) => {
    const current = ensureMeta(editIndex, dynamicFields).columns?.[colIdx];
    return current || `Col ${colIdx + 1}`;
  });
  const normalizedTable = rawTable.map((row) => {
    const rowCopy = [...row];
    if (rowCopy.length < colCount) {
      rowCopy.push(...Array(colCount - rowCopy.length).fill(""));
    }
    return rowCopy;
  });

  const filteredAndSortedRows = useMemo(() => {
    const needle = tableSearch.trim().toLowerCase();
    const base = normalizedTable
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => {
        if (!needle) return true;
        return row.some((cell) => String(cell ?? "").toLowerCase().includes(needle));
      });

    if (sortState.col === null || sortState.dir === null) return base;

    const colIndex = sortState.col;
    const direction = sortState.dir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      const left = String(a.row[colIndex] ?? "").toLowerCase();
      const right = String(b.row[colIndex] ?? "").toLowerCase();
      return left.localeCompare(right) * direction;
    });
  }, [normalizedTable, tableSearch, sortState]);

  const toggleSort = (colIdx: number) => {
    setSortState((current) => {
      if (current.col !== colIdx) return { col: colIdx, dir: "asc" };
      if (current.dir === "asc") return { col: colIdx, dir: "desc" };
      if (current.dir === "desc") return { col: null, dir: null };
      return { col: colIdx, dir: "asc" };
    });
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-muted/20 p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search rows..."
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={() => addTableRow(editIndex, dynamicFields, saveField, setValue)}>
            + Row
          </Button>
          <Button type="button" variant="outline" onClick={() => addTableCol(editIndex, dynamicFields, saveField, setValue)}>
            + Column
          </Button>
          <Button type="button" variant="outline" onClick={() => openBulkEdit(editIndex, dynamicFields, setBulkEdit)}>
            Import CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const csv = tableToCsv(normalizedTable);
              if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(csv);
              }
            }}
          >
            Copy CSV
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (typeof window !== "undefined" && !window.confirm("Clear all table rows and reset to one empty row?")) {
                return;
              }
              syncTableColumns(editIndex, [Array(colCount).fill("")], dynamicFields, saveField, setValue);
            }}
          >
            Clear
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {normalizedTable.length} rows | {colCount} columns
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/40 sticky top-0 z-10">
            <tr>
              <th className="border p-2 text-left text-xs font-semibold align-top">#</th>
              {columnsMeta.map((col, colIdx) => (
                <th key={`col-${colIdx}`} className="border p-2 text-left text-xs font-semibold align-top">
                  <div className="space-y-2 min-w-[220px]">
                    <Input
                      key={`col-input-${colIdx}-${col}`}
                      defaultValue={col}
                      onBlur={(e) => renameTableCol(editIndex, colIdx, e.target.value, dynamicFields, saveField, setValue)}
                      placeholder={`Column ${colIdx + 1}`}
                      className="h-8"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => toggleSort(colIdx)}
                      >
                        Sort
                        {sortState.col === colIdx && sortState.dir ? ` (${sortState.dir})` : ""}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => moveTableCol(editIndex, colIdx, "left", dynamicFields, saveField, setValue)}
                      >
                        Left
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => moveTableCol(editIndex, colIdx, "right", dynamicFields, saveField, setValue)}
                      >
                        Right
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive"
                        onClick={() => removeTableCol(editIndex, colIdx, dynamicFields, saveField, setValue)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
              <th className="border p-2 text-left text-xs font-semibold align-top">Row Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td className="p-4 text-sm text-muted-foreground" colSpan={colCount + 2}>
                  No rows matched your search.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map(({ row, rowIndex }) => (
                <tr key={`row-${rowIndex}`}>
                  <td className="border p-2 align-top">
                    <span className="text-xs text-muted-foreground">{rowIndex + 1}</span>
                  </td>
                  {row.map((cell, colIdx) => {
                    const initialValue = String(cell ?? "");
                    return (
                      <td key={`cell-${rowIndex}-${colIdx}`} className="border p-1 align-top">
                        <Input
                          key={`input-${rowIndex}-${colIdx}-${initialValue}`}
                          defaultValue={initialValue}
                          onBlur={(e) => {
                            if (e.target.value !== initialValue) {
                              updateTableCell(editIndex, rowIndex, colIdx, e.target.value, dynamicFields, saveField, setValue);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          }}
                        />
                      </td>
                    );
                  })}
                  <td className="border p-1 align-top">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => duplicateTableRow(editIndex, rowIndex, dynamicFields, saveField, setValue)}
                      >
                        Duplicate
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => reorderTableRows(editIndex, rowIndex, rowIndex - 1, dynamicFields, saveField, setValue)}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() => reorderTableRows(editIndex, rowIndex, rowIndex + 1, dynamicFields, saveField, setValue)}
                      >
                        Down
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        className="h-8 px-2 text-xs text-destructive"
                        onClick={() => deleteTableRow(editIndex, rowIndex, dynamicFields, saveField, setValue)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => openBulkEdit(editIndex, dynamicFields, setBulkEdit)}>
          Bulk Edit Raw
        </Button>
      </div>
    </div>
  );
}


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
  const { control, watch, setValue, formState } = useFormContext();
  const { fields, append, update, remove, move, insert, replace } = useFieldArray({
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
  const [tableSearch, setTableSearch] = useState("");

  // preview modal
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  // search/filter/group
  const [search, setSearch] = useState("");
  const [groupByType, setGroupByType] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | DynamicField["type"]>("all");
  const [jsonTransfer, setJsonTransfer] = useState<{ open: boolean; mode: "import" | "export"; text: string }>({
    open: false,
    mode: "export",
    text: "",
  });

  // DnD drag index handled inside component

  const openEditor = (index: number) => {
    setEditIndex(index);
    setDialogOpen(true);
  };
  const closeEditor = () => {
    setEditIndex(null);
    setDialogOpen(false);
    setTableSearch("");
  };

  // Add templates
  const addText = () => append({ label: "New Text", type: "text", value: "" });
  const addJson = () => append({ label: "Structured JSON", type: "json", value: [] });
  const addTable = () => append({ label: "New Table", type: "table", value: [[""]], meta: { columns: ["Col 1"] } });
  const addRich = () => append({ label: "Rich Text", type: "richtext", value: { json: null, html: "" } });
  const addPreset = () => {
    append([
      { label: "Overview", type: "richtext", value: { json: null, html: "" } },
      { label: "Quick Facts", type: "table", value: [["Key", "Value"]], meta: { columns: ["Key", "Value"] } },
      { label: "Extra Meta", type: "json", value: {} },
    ] as any);
  };

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
  // Search/filter/group helpers
  const filteredFields = fields
    .map((f, idx) => ({ f, idx }))
    .filter(({ idx }) => {
      if (!search) return true;
      const label = dynamicFields[idx]?.label?.toLowerCase() || "";
      return label.includes(search.toLowerCase());
    })
    .filter(({ idx }) => (typeFilter === "all" ? true : dynamicFields[idx]?.type === typeFilter));

  const groupedFields = groupByType
    ? filteredFields.reduce((acc, item) => {
        const type = dynamicFields[item.idx]?.type || "other";
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {} as Record<string, Array<{ f: typeof fields[0]; idx: number }>>)
    : null;

  const typeCounts = dynamicFields.reduce(
    (acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    },
    { text: 0, richtext: 0, table: 0, json: 0 } as Record<DynamicField["type"], number>
  );

  const openExport = () => {
    setJsonTransfer({
      open: true,
      mode: "export",
      text: JSON.stringify(dynamicFields, null, 2),
    });
  };

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(dynamicFields, null, 2));
      toast.success("Dynamic fields JSON copied");
    } catch {
      toast.error("Unable to copy JSON");
    }
  };

  const openImport = () => {
    setJsonTransfer({
      open: true,
      mode: "import",
      text: "",
    });
  };

  const applyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonTransfer.text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array");
      const normalized = parsed.map((item, idx) => {
        if (!item || typeof item !== "object") throw new Error(`Invalid item at index ${idx}`);
        if (typeof item.label !== "string" || !item.label.trim()) throw new Error(`Invalid label at index ${idx}`);
        if (!["text", "richtext", "table", "json"].includes(item.type)) throw new Error(`Invalid type at index ${idx}`);
        return item;
      });
      replace(normalized as any);
      setValue("dynamicFields", normalized, { shouldDirty: true });
      toast.success("Dynamic fields imported");
      setJsonTransfer({ open: false, mode: "import", text: "" });
    } catch (error: any) {
      toast.error(error?.message || "Invalid JSON");
    }
  };

  // ...existing code...

  // --- Render ---
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Dynamic Fields Builder</h3>
            <p className="text-xs text-muted-foreground">Build modular content blocks with reusable field types.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">Total: {dynamicFields.length}</Badge>
            <Badge variant="outline">Text: {typeCounts.text}</Badge>
            <Badge variant="outline">Rich: {typeCounts.richtext}</Badge>
            <Badge variant="outline">Table: {typeCounts.table}</Badge>
            <Badge variant="outline">JSON: {typeCounts.json}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="default">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={addText}>Text</DropdownMenuItem>
              <DropdownMenuItem onClick={addRich}>Rich Text</DropdownMenuItem>
              <DropdownMenuItem onClick={addTable}>Table</DropdownMenuItem>
              <DropdownMenuItem onClick={addJson}>JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={addPreset}>Starter Preset</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button type="button" variant="outline" onClick={() => setGroupByType((v) => !v)}>
            <LayoutGrid className="h-4 w-4 mr-1" />
            {groupByType ? "Ungroup" : "Group by Type"}
          </Button>

          <Button type="button" variant="outline" onClick={openImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import JSON
          </Button>
          <Button type="button" variant="outline" onClick={openExport}>
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
          <Button type="button" variant="outline" onClick={copyExport}>
            <Copy className="h-4 w-4 mr-1" />
            Copy JSON
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fields by label..."
              className="pl-9"
            />
          </div>
          <div className="relative">
            <ListFilter className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-10 w-full rounded-md border bg-background px-9 text-sm"
              aria-label="Filter dynamic fields by type"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="richtext">Rich Text</option>
              <option value="table">Table</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </Card>

      {filteredFields.length === 0 ? (
        <Card className="p-6 text-center space-y-2">
          <Filter className="h-6 w-6 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No dynamic fields match current filter/search.</p>
          <div className="flex justify-center gap-2">
            <Button type="button" variant="outline" onClick={() => { setSearch(""); setTypeFilter("all"); }}>
              Reset Filters
            </Button>
            <Button type="button" onClick={addText}>Add First Field</Button>
          </div>
        </Card>
      ) : null}

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
          : filteredFields.map(({ f, idx }) => (
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
        <DialogContent className="max-w-[min(1280px,96vw)] h-[min(92vh,920px)] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Edit Dynamic Field</DialogTitle>
            <DialogDescription className="sr-only">
              Edit field label, type, and value for the selected dynamic field.
            </DialogDescription>
          </DialogHeader>

          {editIndex !== null && (
            <>
              {/* Label + Type */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="mt-2">
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
                  <DynamicTableEditor
                    editIndex={editIndex}
                    dynamicFields={dynamicFields}
                    saveField={saveField}
                    setValue={setValue}
                    tableSearch={tableSearch}
                    setTableSearch={setTableSearch}
                    setBulkEdit={setBulkEdit}
                  />
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
                              mode="full"
                              value={currentVal.json || null}      // <- ONLY JSON
                              onChange={(data) => {
                                const val = { json: data.json, html: data.html };
                                field.onChange(val);
                                setValue(`dynamicFields.${editIndex}.value`, val);
                              }}
                            />

                          </EditorIsolated>

                          <div className="mt-2 flex gap-2">
                            <Button type="button" onClick={() => {
                              const val = (dynamicFields[editIndex]?.value ?? { json: null, html: "" }) as { json: any; html: string };
                              if ((!val?.html || val.html.length === 0) && val?.json) {
                                const newHtml = convertLexicalJsonToHtml(val.json);
                                const newVal = { ...(val as any), html: newHtml };
                                field.onChange(newVal);
                                setValue(`dynamicFields.${editIndex}.value`, newVal, { shouldDirty: true });
                              }
                            }}>Ensure HTML</Button>

                            <Button type="button" onClick={() => closeEditor()}>Save</Button>
                          </div>
                        </div>
                      );
                    }}
                  />
                )}
              </div>
              </div>
            </>
          )}

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" onClick={() => closeEditor()}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Type Change Dialog */}
      <Dialog open={confirmTypeChange.open} onOpenChange={(v) => setConfirmTypeChange({ ...confirmTypeChange, open: v })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change field type?</DialogTitle>
            <DialogDescription className="sr-only">
              Confirm changing the field type while preserving the existing value.
            </DialogDescription>
          </DialogHeader>
          <div className="p-2">
            <p>Changing the field type may make the existing value irrelevant for the new type. As requested, we will <strong>not</strong> reset the value automatically. Do you want to continue?</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmTypeChange({ open: false, idx: null })}>Cancel</Button>
            <Button type="button" onClick={() => performTypeChange(confirmTypeChange, dynamicFields, update, setConfirmTypeChange)}>Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog for tables */}
      <Dialog open={bulkEdit.open} onOpenChange={(v) => setBulkEdit({ ...bulkEdit, open: v })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Edit Table (CSV lines)</DialogTitle>
            <DialogDescription className="sr-only">
              Paste comma separated rows to update the current table.
            </DialogDescription>
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
            <Button type="button" variant="ghost" onClick={() => setBulkEdit({ open: false, idx: null, text: "" })}>Cancel</Button>
            <Button type="button" onClick={() => applyBulkEdit(bulkEdit, dynamicFields, saveField, setValue, setBulkEdit)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={jsonTransfer.open} onOpenChange={(v) => setJsonTransfer((s) => ({ ...s, open: v }))}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{jsonTransfer.mode === "import" ? "Import Dynamic Fields JSON" : "Export Dynamic Fields JSON"}</DialogTitle>
            <DialogDescription className="sr-only">
              Import or export the dynamic fields definition as JSON.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>
              {jsonTransfer.mode === "import"
                ? "Paste JSON array of dynamic fields"
                : "Generated JSON (read-only)"}
            </Label>
            <textarea
              className="w-full h-80 border rounded p-2 mt-2 font-mono text-xs"
              value={jsonTransfer.text}
              readOnly={jsonTransfer.mode === "export"}
              onChange={(e) => setJsonTransfer((s) => ({ ...s, text: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setJsonTransfer((s) => ({ ...s, open: false }))}>Close</Button>
            {jsonTransfer.mode === "import" ? (
              <Button type="button" onClick={applyJsonImport}>Apply Import</Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewIdx !== null} onOpenChange={(open) => !open && setPreviewIdx(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Field Preview</DialogTitle>
            <DialogDescription className="sr-only">
              Preview the rendered value for the selected dynamic field.
            </DialogDescription>
          </DialogHeader>
          {previewIdx !== null && dynamicFields[previewIdx] ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{dynamicFields[previewIdx].type}</Badge>
                <span className="font-semibold">{dynamicFields[previewIdx].label || `Field ${previewIdx + 1}`}</span>
              </div>
              {dynamicFields[previewIdx].type === "richtext" &&
              typeof dynamicFields[previewIdx].value === "object" &&
              dynamicFields[previewIdx].value !== null &&
              "html" in dynamicFields[previewIdx].value ? (
                <Card className="p-4">
                  <div dangerouslySetInnerHTML={{ __html: dynamicFields[previewIdx].value.html || "" }} />
                </Card>
              ) : (
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                  {JSON.stringify(dynamicFields[previewIdx], null, 2)}
                </pre>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" onClick={() => setPreviewIdx(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
