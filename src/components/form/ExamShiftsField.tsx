import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/shadcn/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn/ui/dialog";

type ExamShiftFormState = {
  shiftName: string;
  shiftDate: string;
  reportingTime: string;
  gateClosingTime: string;
  examTime: string;
  examEndTime: string;
  instructions: string[];
  status: string;
  language: string;
  examType: string;
  maxCapacity?: number;
  isSpecialShift: boolean;
  otherDetails: string;
};

type ExamShiftErrors = Partial<Record<keyof ExamShiftFormState, string>>;

const createDefaultShiftState = (): ExamShiftFormState => ({
  shiftName: "",
  shiftDate: "",
  reportingTime: "",
  gateClosingTime: "",
  examTime: "",
  examEndTime: "",
  instructions: [],
  status: "active",
  language: "",
  examType: "",
  maxCapacity: undefined,
  isSpecialShift: false,
  otherDetails: "",
});

const normalizeShift = (value: Partial<ExamShiftFormState> | undefined): ExamShiftFormState => {
  const base = createDefaultShiftState();
  const next = { ...base, ...(value || {}) };
  return {
    ...next,
    shiftName: String(next.shiftName ?? ""),
    shiftDate: String(next.shiftDate ?? ""),
    reportingTime: String(next.reportingTime ?? ""),
    gateClosingTime: String(next.gateClosingTime ?? ""),
    examTime: String(next.examTime ?? ""),
    examEndTime: String(next.examEndTime ?? ""),
    instructions: Array.isArray(next.instructions)
      ? next.instructions.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [],
    status: String(next.status ?? "active"),
    language: String(next.language ?? ""),
    examType: String(next.examType ?? ""),
    maxCapacity:
      next.maxCapacity === undefined || next.maxCapacity === null || Number.isNaN(Number(next.maxCapacity))
        ? undefined
        : Number(next.maxCapacity),
    isSpecialShift: Boolean(next.isSpecialShift),
    otherDetails: String(next.otherDetails ?? ""),
  };
};

const compareTime = (left: string, right: string) => {
  if (!left || !right) return 0;
  return left.localeCompare(right);
};

export function ExamShiftsField({ name = "examShifts" }: { name?: string }) {
  const { control, getValues } = useFormContext();
  const { fields, append, update, remove } = useFieldArray({ control, name });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [formState, setFormState] = useState<ExamShiftFormState>(createDefaultShiftState);
  const [fieldErrors, setFieldErrors] = useState<ExamShiftErrors>({});

  const validateShift = (candidate: ExamShiftFormState): ExamShiftErrors => {
    const errors: ExamShiftErrors = {};

    if (!candidate.shiftName.trim()) errors.shiftName = "Shift name is required";
    if (!candidate.shiftDate) errors.shiftDate = "Shift date is required";
    if (!candidate.reportingTime) errors.reportingTime = "Reporting time is required";
    if (!candidate.gateClosingTime) errors.gateClosingTime = "Gate closing time is required";
    if (!candidate.examTime) errors.examTime = "Exam start time is required";

    if (
      candidate.reportingTime &&
      candidate.gateClosingTime &&
      compareTime(candidate.reportingTime, candidate.gateClosingTime) > 0
    ) {
      errors.gateClosingTime = "Gate closing time must be after reporting time";
    }

    if (
      candidate.gateClosingTime &&
      candidate.examTime &&
      compareTime(candidate.gateClosingTime, candidate.examTime) > 0
    ) {
      errors.examTime = "Exam start time must be after gate closing time";
    }

    if (
      candidate.examEndTime &&
      candidate.examTime &&
      compareTime(candidate.examEndTime, candidate.examTime) <= 0
    ) {
      errors.examEndTime = "Exam end time must be after exam start time";
    }

    if (candidate.maxCapacity !== undefined && candidate.maxCapacity < 0) {
      errors.maxCapacity = "Max capacity cannot be negative";
    }

    const normalizedName = candidate.shiftName.trim().toLowerCase();
    const duplicate = fields.some((_, idx) => {
      if (editIdx !== null && idx === editIdx) return false;
      const existing = normalizeShift(getValues(`${name}.${idx}`));
      return (
        existing.shiftDate === candidate.shiftDate &&
        existing.shiftName.trim().toLowerCase() === normalizedName
      );
    });
    if (duplicate) errors.shiftName = "A shift with same name and date already exists";

    return errors;
  };

  const shiftCount = fields.length;
  const shiftNames = fields.map((_, idx) => {
    const shift = getValues(`${name}.${idx}`);
    return shift?.shiftName || `Shift ${idx + 1}`;
  });

  const openAddDialog = () => {
    setEditIdx(null);
    setFormState(createDefaultShiftState());
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (idx: number) => {
    const values = getValues(`${name}.${idx}`);
    setEditIdx(idx);
    setFormState(normalizeShift(values));
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    const normalized = normalizeShift(formState);
    const errors = validateShift(normalized);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (editIdx === null) append(normalized);
    else update(editIdx, normalized);
    setDialogOpen(false);
  };

  return (
    <div>
      <FormLabel className="mb-2 font-semibold">Exam Shifts</FormLabel>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {shiftCount} shift{shiftCount !== 1 ? "s" : ""} added
        </span>
        {shiftNames.length > 0 && (
          <span className="text-xs text-gray-500">
            [
            {shiftNames.map((shiftName, idx) => (
              <span key={idx}>
                {shiftName}
                {idx < shiftNames.length - 1 ? ", " : ""}
              </span>
            ))}
            ]
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((field, idx) => {
          const shift = getValues(`${name}.${idx}`);
          return (
            <div key={field.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span className="font-medium">{shift?.shiftName || `Shift ${idx + 1}`}</span>
              <div className="flex gap-2">
                <Button type="button" size="icon" variant="ghost" onClick={() => openEditDialog(idx)} title="Edit">
                  <PencilIcon />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(idx)} title="Remove">
                  <Trash2Icon />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={openAddDialog} size="sm" variant="secondary">
          <span aria-hidden="true">+</span> Add Shift
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIdx === null ? "Add Exam Shift" : "Edit Exam Shift"}</DialogTitle>
            <DialogDescription className="sr-only">
              Configure exam shift date, timings, status and optional metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="z-200 mt-2 grid grid-cols-1 gap-4 md:grid-cols-2" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <FormItem>
              <FormLabel>Shift Name</FormLabel>
              <FormControl>
                <Input value={formState.shiftName} onChange={(e) => setFormState((f) => ({ ...f, shiftName: e.target.value }))} placeholder="Shift Name" />
              </FormControl>
              {fieldErrors.shiftName ? <p className="text-xs text-destructive">{fieldErrors.shiftName}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Shift Date</FormLabel>
              <FormControl>
                <Input type="date" value={formState.shiftDate} onChange={(e) => setFormState((f) => ({ ...f, shiftDate: e.target.value }))} />
              </FormControl>
              {fieldErrors.shiftDate ? <p className="text-xs text-destructive">{fieldErrors.shiftDate}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Reporting Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.reportingTime} onChange={(e) => setFormState((f) => ({ ...f, reportingTime: e.target.value }))} />
              </FormControl>
              {fieldErrors.reportingTime ? <p className="text-xs text-destructive">{fieldErrors.reportingTime}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Gate Closing Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.gateClosingTime} onChange={(e) => setFormState((f) => ({ ...f, gateClosingTime: e.target.value }))} />
              </FormControl>
              {fieldErrors.gateClosingTime ? <p className="text-xs text-destructive">{fieldErrors.gateClosingTime}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam Start Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.examTime} onChange={(e) => setFormState((f) => ({ ...f, examTime: e.target.value }))} />
              </FormControl>
              {fieldErrors.examTime ? <p className="text-xs text-destructive">{fieldErrors.examTime}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam End Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.examEndTime} onChange={(e) => setFormState((f) => ({ ...f, examEndTime: e.target.value }))} />
              </FormControl>
              {fieldErrors.examEndTime ? <p className="text-xs text-destructive">{fieldErrors.examEndTime}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Input
                  value={formState.instructions?.join(", ") || ""}
                  onChange={(e) =>
                    setFormState((f) => ({
                      ...f,
                      instructions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="Comma separated instructions"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select value={formState.status} onChange={(e) => setFormState((f) => ({ ...f, status: e.target.value }))} className="w-full rounded border p-2">
                  <option value="active">Active</option>
                  <option value="postponed">Postponed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input value={formState.language} onChange={(e) => setFormState((f) => ({ ...f, language: e.target.value }))} placeholder="Language" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam Type</FormLabel>
              <FormControl>
                <Input value={formState.examType} onChange={(e) => setFormState((f) => ({ ...f, examType: e.target.value }))} placeholder="Exam Type (CBT, OMR, etc.)" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Max Capacity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={formState.maxCapacity ?? ""}
                  onChange={(e) => setFormState((f) => ({ ...f, maxCapacity: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Max Capacity"
                />
              </FormControl>
              {fieldErrors.maxCapacity ? <p className="text-xs text-destructive">{fieldErrors.maxCapacity}</p> : null}
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Special Shift</FormLabel>
              <FormControl>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!formState.isSpecialShift}
                    onChange={(e) => setFormState((f) => ({ ...f, isSpecialShift: e.target.checked }))}
                  />
                  Special arrangement
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem className="md:col-span-2">
              <FormLabel>Other Details</FormLabel>
              <FormControl>
                <Input value={formState.otherDetails} onChange={(e) => setFormState((f) => ({ ...f, otherDetails: e.target.value }))} placeholder="Other Details" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDialogSave}>
              {editIdx === null ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
