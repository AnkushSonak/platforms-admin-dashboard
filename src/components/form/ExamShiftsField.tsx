import { useFieldArray, useFormContext } from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/shadcn/ui/form";
import { Input } from "@/components/shadcn/ui/input";
import { Button } from "@/components/shadcn/ui/button";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../shadcn/ui/dialog";
import { DeleteIcon, PencilIcon, Trash2Icon } from "lucide-react";

export function ExamShiftsField({ name = "examShifts" }: { name?: string }) {
  const { control, register, setValue, getValues } = useFormContext();
  const { fields, append, update, remove } = useFieldArray({ control, name });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
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
  const [formState, setFormState] = useState<ExamShiftFormState>({
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
    otherDetails: ""
  });

  // Show summary and shift names
  const shiftCount = fields.length;
  const shiftNames = fields.map((f, idx) => {
    const shift = getValues(`${name}.${idx}`);
    return shift?.shiftName || `Shift ${idx + 1}`;
  });

  // Open dialog for add/edit
  const openAddDialog = () => {
    setEditIdx(null);
    setFormState({
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
      otherDetails: ""
    });
    setDialogOpen(true);
  };
  const openEditDialog = (idx: number) => {
    const values = getValues(`${name}.${idx}`);
    setEditIdx(idx);
    setFormState({ ...values });
    setDialogOpen(true);
  };

  // Handle dialog save
  const handleDialogSave = () => {
    if (editIdx === null) {
      append(formState);
    } else {
      update(editIdx, formState);
    }
    setDialogOpen(false);
  };

  return (
    <div>
        {/* <div className="h-fit flex flex-row gap-4"> */}
      <FormLabel className="mb-2 font-semibold">Exam Shifts</FormLabel>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">{shiftCount} shift{shiftCount !== 1 ? "s" : ""} added</span>
        {shiftNames.length > 0 && (
          <span className="text-xs text-gray-500">[
            {shiftNames.map((name, idx) => (
              <span key={idx}>{name}{idx < shiftNames.length - 1 ? ", " : ""}</span>
            ))}
          ]</span>
        )}
      </div>
      {/* </div> */}
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
      <div className="flex justify-end mt-4">
        <Button type="button" onClick={openAddDialog} size="sm" variant="secondary">
          <span aria-hidden="true">➕</span> Add Shift
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIdx === null ? "Add Exam Shift" : "Edit Exam Shift"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 z-200 md:grid-cols-2 gap-4 mt-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <FormItem>
              <FormLabel>Shift Name</FormLabel>
              <FormControl>
                <Input value={formState.shiftName} onChange={e => setFormState(f => ({ ...f, shiftName: e.target.value }))} placeholder="Shift Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Shift Date</FormLabel>
              <FormControl>
                <Input type="date" value={formState.shiftDate} onChange={e => setFormState(f => ({ ...f, shiftDate: e.target.value }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Reporting Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.reportingTime} onChange={e => setFormState(f => ({ ...f, reportingTime: e.target.value }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Gate Closing Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.gateClosingTime} onChange={e => setFormState(f => ({ ...f, gateClosingTime: e.target.value }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam Start Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.examTime} onChange={e => setFormState(f => ({ ...f, examTime: e.target.value }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam End Time</FormLabel>
              <FormControl>
                <Input type="time" value={formState.examEndTime} onChange={e => setFormState(f => ({ ...f, examEndTime: e.target.value }))} />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Input value={formState.instructions?.join(", ") || ""} onChange={e => setFormState(f => ({ ...f, instructions: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} placeholder="Comma separated instructions" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <>
                  <select value={formState.status} onChange={e => setFormState(f => ({ ...f, status: e.target.value }))} className="w-full border rounded p-2">
                    <option value="active">Active</option>
                    <option value="postponed">Postponed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input value={formState.language} onChange={e => setFormState(f => ({ ...f, language: e.target.value }))} placeholder="Language" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Exam Type</FormLabel>
              <FormControl>
                <Input value={formState.examType} onChange={e => setFormState(f => ({ ...f, examType: e.target.value }))} placeholder="Exam Type (CBT, OMR, etc.)" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Max Capacity</FormLabel>
              <FormControl>
                <Input type="number" value={formState.maxCapacity ?? ""} onChange={e => setFormState(f => ({ ...f, maxCapacity: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Max Capacity" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Special Shift</FormLabel>
              <FormControl>
                <>
                  <input type="checkbox" checked={!!formState.isSpecialShift} onChange={e => setFormState(f => ({ ...f, isSpecialShift: e.target.checked }))} /> Special arrangement
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem className="md:col-span-2">
              <FormLabel>Other Details</FormLabel>
              <FormControl>
                <Input value={formState.otherDetails} onChange={e => setFormState(f => ({ ...f, otherDetails: e.target.value }))} placeholder="Other Details" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleDialogSave}>{editIdx === null ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
