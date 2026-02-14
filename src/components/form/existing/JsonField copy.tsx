import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export interface JsonFieldItem {
  title: string;
  subtitle?: string;
  type: string;
  date?: Date;
  tag?: string;
  rightCode?: string;
  isSelected?: boolean;
  description?: string;
  value?: string;
}

interface JsonFieldProps {
  value: JsonFieldItem[];
  onChange: (items: JsonFieldItem[]) => void;
  title?: string;
  allowedTypes?: string[];
  errors?: string;
}

const defaultTypes = ["text", "number", "date", "email", "url", "boolean", "json"];

function parseValue(val: any): JsonFieldItem[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val);
      if (Array.isArray(arr)) return arr;
      if (arr && typeof arr === "object") {
        return Object.entries(arr).map(([title, value]) => ({
          title,
          value: String(value),
          type: typeof value,
        }));
      }
    } catch {
      return [{ title: "", value: val, type: "text" }];
    }
  }
  if (val && typeof val === "object") {
    return Object.entries(val).map(([title, v]) => {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const { subtitle, date, tag, rightCode, isSelected, description, value: innerValue, type } =
          v as any;
        return {
          title,
          subtitle: subtitle ?? undefined,
          type: type ?? (innerValue !== undefined ? typeof innerValue : "text"),
          date: date ? new Date(date) : undefined,
          tag: tag ?? undefined,
          rightCode: rightCode ?? undefined,
          isSelected: Boolean(isSelected),
          description: description ?? undefined,
          value: innerValue ?? undefined,
        };
      }
      return { title, value: String(v), type: typeof v };
    });
  }
  return [];
}

/* ------------------------- Sortable Row Component ------------------------ */

const SortableRow = ({ id, children }: any) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="rounded-md shadow-sm p-3 border mb-3"
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 pt-1"
        >
          ☰
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

/* ------------------------------- Main Component ------------------------------- */

export const JsonField: React.FC<JsonFieldProps> = ({
  value,
  onChange,
  title,
  allowedTypes = defaultTypes,
  errors,
}) => {
  const parsedValue = parseValue(value).map((item) => ({
    title: item.title ?? "",
    type: item.type ?? allowedTypes[0],
    value: item.value ?? "",
    subtitle: item.subtitle,
    date: item.date,
    tag: item.tag,
    rightCode: item.rightCode,
    isSelected: item.isSelected,
    description: item.description,
  }));

  const sensors = useSensors(useSensor(PointerSensor));

  const handleItemChange = (idx: number, field: keyof JsonFieldItem, val: any) => {
    const updated = [...parsedValue];
    if (field === "date") updated[idx][field] = val ? new Date(val) : undefined;
    else if (field === "isSelected") updated[idx][field] = val === "true";
    else updated[idx][field] = val;
    onChange(updated);
  };

  const handleRemove = (idx: number) => {
    const updated = [...parsedValue];
    updated.splice(idx, 1);
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...parsedValue, { title: "", value: "", type: allowedTypes[0] }]);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = parsedValue.findIndex((_, i) => i === Number(active.id));
    const newIndex = parsedValue.findIndex((_, i) => i === Number(over.id));

    const sorted = arrayMove(parsedValue, oldIndex, newIndex);
    onChange(sorted);
  };

  return (
    <div className="space-y-2 border rounded-md max-h-[70vh] overflow-y-auto">
      {title && <Label>{title}</Label>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={parsedValue.map((_, idx) => String(idx))}
          strategy={verticalListSortingStrategy}
        >
          {parsedValue.map((item, idx) => (
            <SortableRow key={idx} id={String(idx)}>
              <div className="flex flex-col gap-2 pb-2">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                    className="w-full"
                  />

                  <select
                    value={item.type}
                    onChange={(e) => handleItemChange(idx, "type", e.target.value)}
                    className="w-1/5 border rounded px-2 py-1"
                  >
                    {allowedTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {item.type === "boolean" ? (
                    <select
                      value={
                        item.value === "true"
                          ? "true"
                          : item.value === "false"
                          ? "false"
                          : ""
                      }
                      onChange={(e) => handleItemChange(idx, "value", e.target.value)}
                      className="w-1/4 border rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : item.type === "json" ? (
                    <Input
                      placeholder="JSON Value"
                      value={item.value}
                      onChange={(e) => handleItemChange(idx, "value", e.target.value)}
                      className="w-1/4 font-mono"
                    />
                  ) : (
                    <Input
                      placeholder="Value"
                      value={item.value}
                      type={
                        item.type === "number"
                          ? "number"
                          : item.type === "date"
                          ? "date"
                          : item.type === "email"
                          ? "email"
                          : item.type === "url"
                          ? "url"
                          : "text"
                      }
                      onChange={(e) => handleItemChange(idx, "value", e.target.value)}
                      className="w-1/4"
                    />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => handleRemove(idx)}
                  >
                    Remove
                  </Button>
                </div>

                <details className="ml-2 mt-2">
                  <summary className="cursor-pointer text-xs">
                    Show extra fields
                  </summary>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Subtitle"
                      value={item.subtitle ?? ""}
                      onChange={(e) => handleItemChange(idx, "subtitle", e.target.value)}
                    />

                    <Input
                      placeholder="Tag"
                      value={item.tag ?? ""}
                      onChange={(e) => handleItemChange(idx, "tag", e.target.value)}
                    />

                    <Input
                      placeholder="Right Code"
                      value={item.rightCode ?? ""}
                      onChange={(e) =>
                        handleItemChange(idx, "rightCode", e.target.value)
                      }
                    />

                    <Input
                      placeholder="Description"
                      value={item.description ?? ""}
                      onChange={(e) =>
                        handleItemChange(idx, "description", e.target.value)
                      }
                    />

                    <input
                      type="date"
                      value={
                        item.date
                          ? new Date(item.date).toISOString().slice(0, 10)
                          : ""
                      }
                      onChange={(e) => handleItemChange(idx, "date", e.target.value)}
                      className="border rounded px-2 py-1"
                    />

                    <select
                      value={item.isSelected ? "true" : "false"}
                      onChange={(e) =>
                        handleItemChange(idx, "isSelected", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="false">Not Selected</option>
                      <option value="true">Selected</option>
                    </select>
                  </div>
                </details>
              </div>
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        onClick={handleAdd}
        className=" px-3 py-1 rounded"
      >
        + Add Field
      </Button>

      {errors && <p className="text-red-500 text-sm mt-1">{errors}</p>}
    </div>
  );
};
