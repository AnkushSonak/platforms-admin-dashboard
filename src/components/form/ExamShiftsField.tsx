// import React, { useState } from "react";
// import { useFieldArray, useFormContext } from "react-hook-form";
// import { PencilIcon, Trash2Icon } from "lucide-react";
// import { Button } from "@/components/shadcn/ui/button";
// import { Input } from "@/components/shadcn/ui/input";
// import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/shadcn/ui/form";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../shadcn/ui/dialog";

// type ExamShiftFormState = {
//   shiftName: string;
//   shiftDate: string;
//   reportingTime: string;
//   gateClosingTime: string;
//   examTime: string;
//   examEndTime: string;
//   instructions: string[];
//   status: string;
//   language: string;
//   examType: string;
//   maxCapacity?: number;
//   isSpecialShift: boolean;
//   otherDetails: string;
// };

// type ExamShiftErrors = Partial<Record<keyof ExamShiftFormState, string>>;

// const createDefaultShiftState = (): ExamShiftFormState => ({
//   shiftName: "",
//   shiftDate: "",
//   reportingTime: "",
//   gateClosingTime: "",
//   examTime: "",
//   examEndTime: "",
//   instructions: [],
//   status: "active",
//   language: "",
//   examType: "",
//   maxCapacity: undefined,
//   isSpecialShift: false,
//   otherDetails: "",
// });

// const normalizeShift = (value: Partial<ExamShiftFormState> | undefined): ExamShiftFormState => {
//   const base = createDefaultShiftState();
//   const next = { ...base, ...(value || {}) };
//   return {
//     ...next,
//     shiftName: String(next.shiftName ?? ""),
//     shiftDate: String(next.shiftDate ?? ""),
//     reportingTime: String(next.reportingTime ?? ""),
//     gateClosingTime: String(next.gateClosingTime ?? ""),
//     examTime: String(next.examTime ?? ""),
//     examEndTime: String(next.examEndTime ?? ""),
//     instructions: Array.isArray(next.instructions)
//       ? next.instructions.map((item) => String(item ?? "").trim()).filter(Boolean)
//       : [],
//     status: String(next.status ?? "active"),
//     language: String(next.language ?? ""),
//     examType: String(next.examType ?? ""),
//     maxCapacity:
//       next.maxCapacity === undefined || next.maxCapacity === null || Number.isNaN(Number(next.maxCapacity))
//         ? undefined
//         : Number(next.maxCapacity),
//     isSpecialShift: Boolean(next.isSpecialShift),
//     otherDetails: String(next.otherDetails ?? ""),
//   };
// };

// const compareTime = (left: string, right: string) => {
//   if (!left || !right) return 0;
//   return left.localeCompare(right);
// };

// export function ExamShiftsField({ name = "examShifts" }: { name?: string }) {
//   const { control, getValues } = useFormContext();
//   const { fields, append, update, remove } = useFieldArray({ control, name });
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editIdx, setEditIdx] = useState<number | null>(null);
//   const [formState, setFormState] = useState<ExamShiftFormState>(createDefaultShiftState);
//   const [fieldErrors, setFieldErrors] = useState<ExamShiftErrors>({});

//   const validateShift = (candidate: ExamShiftFormState): ExamShiftErrors => {
//     const errors: ExamShiftErrors = {};

//     if (!candidate.shiftName.trim()) errors.shiftName = "Shift name is required";
//     if (!candidate.shiftDate) errors.shiftDate = "Shift date is required";
//     if (!candidate.reportingTime) errors.reportingTime = "Reporting time is required";
//     if (!candidate.gateClosingTime) errors.gateClosingTime = "Gate closing time is required";
//     if (!candidate.examTime) errors.examTime = "Exam start time is required";

//     if (
//       candidate.reportingTime &&
//       candidate.gateClosingTime &&
//       compareTime(candidate.reportingTime, candidate.gateClosingTime) > 0
//     ) {
//       errors.gateClosingTime = "Gate closing time must be after reporting time";
//     }

//     if (
//       candidate.gateClosingTime &&
//       candidate.examTime &&
//       compareTime(candidate.gateClosingTime, candidate.examTime) > 0
//     ) {
//       errors.examTime = "Exam start time must be after gate closing time";
//     }

//     if (
//       candidate.examEndTime &&
//       candidate.examTime &&
//       compareTime(candidate.examEndTime, candidate.examTime) <= 0
//     ) {
//       errors.examEndTime = "Exam end time must be after exam start time";
//     }

//     if (candidate.maxCapacity !== undefined && candidate.maxCapacity < 0) {
//       errors.maxCapacity = "Max capacity cannot be negative";
//     }

//     const normalizedName = candidate.shiftName.trim().toLowerCase();
//     const duplicate = fields.some((_, idx) => {
//       if (editIdx !== null && idx === editIdx) return false;
//       const existing = normalizeShift(getValues(`${name}.${idx}`));
//       return (
//         existing.shiftDate === candidate.shiftDate &&
//         existing.shiftName.trim().toLowerCase() === normalizedName
//       );
//     });
//     if (duplicate) errors.shiftName = "A shift with same name and date already exists";

//     return errors;
//   };

//   const shiftCount = fields.length;
//   const shiftNames = fields.map((_, idx) => {
//     const shift = getValues(`${name}.${idx}`);
//     return shift?.shiftName || `Shift ${idx + 1}`;
//   });

//   const openAddDialog = () => {
//     setEditIdx(null);
//     setFormState(createDefaultShiftState());
//     setFieldErrors({});
//     setDialogOpen(true);
//   };

//   const openEditDialog = (idx: number) => {
//     const values = getValues(`${name}.${idx}`);
//     setEditIdx(idx);
//     setFormState(normalizeShift(values));
//     setFieldErrors({});
//     setDialogOpen(true);
//   };

//   const handleDialogSave = () => {
//     const normalized = normalizeShift(formState);
//     const errors = validateShift(normalized);
//     setFieldErrors(errors);
//     if (Object.keys(errors).length > 0) return;

//     if (editIdx === null) append(normalized);
//     else update(editIdx, normalized);
//     setDialogOpen(false);
//   };

//   return (
//     <div>
//       <FormLabel className="mb-2 font-semibold">Exam Shifts</FormLabel>
//       <div className="mb-2 flex items-center gap-2">
//         <span className="text-sm text-gray-600">
//           {shiftCount} shift{shiftCount !== 1 ? "s" : ""} added
//         </span>
//         {shiftNames.length > 0 && (
//           <span className="text-xs text-gray-500">
//             [
//             {shiftNames.map((shiftName, idx) => (
//               <span key={idx}>
//                 {shiftName}
//                 {idx < shiftNames.length - 1 ? ", " : ""}
//               </span>
//             ))}
//             ]
//           </span>
//         )}
//       </div>

//       <div className="flex flex-col gap-2">
//         {fields.map((field, idx) => {
//           const shift = getValues(`${name}.${idx}`);
//           return (
//             <div key={field.id} className="flex items-center justify-between rounded border px-3 py-2">
//               <span className="font-medium">{shift?.shiftName || `Shift ${idx + 1}`}</span>
//               <div className="flex gap-2">
//                 <Button type="button" size="icon" variant="ghost" onClick={() => openEditDialog(idx)} title="Edit">
//                   <PencilIcon />
//                 </Button>
//                 <Button type="button" size="icon" variant="ghost" onClick={() => remove(idx)} title="Remove">
//                   <Trash2Icon />
//                 </Button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="mt-4 flex justify-end">
//         <Button type="button" onClick={openAddDialog} size="sm" variant="secondary">
//           <span aria-hidden="true">+</span> Add Shift
//         </Button>
//       </div>

//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editIdx === null ? "Add Exam Shift" : "Edit Exam Shift"}</DialogTitle>
//             <DialogDescription className="sr-only">
//               Configure exam shift date, timings, status and optional metadata.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="z-200 mt-2 grid grid-cols-1 gap-4 md:grid-cols-2" style={{ maxHeight: "70vh", overflowY: "auto" }}>
//             <FormItem>
//               <FormLabel>Shift Name</FormLabel>
//               <FormControl>
//                 <Input value={formState.shiftName} onChange={(e) => setFormState((f) => ({ ...f, shiftName: e.target.value }))} placeholder="Shift Name" />
//               </FormControl>
//               {fieldErrors.shiftName ? <p className="text-xs text-destructive">{fieldErrors.shiftName}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Shift Date</FormLabel>
//               <FormControl>
//                 <Input type="date" value={formState.shiftDate} onChange={(e) => setFormState((f) => ({ ...f, shiftDate: e.target.value }))} />
//               </FormControl>
//               {fieldErrors.shiftDate ? <p className="text-xs text-destructive">{fieldErrors.shiftDate}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Reporting Time</FormLabel>
//               <FormControl>
//                 <Input type="time" value={formState.reportingTime} onChange={(e) => setFormState((f) => ({ ...f, reportingTime: e.target.value }))} />
//               </FormControl>
//               {fieldErrors.reportingTime ? <p className="text-xs text-destructive">{fieldErrors.reportingTime}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Gate Closing Time</FormLabel>
//               <FormControl>
//                 <Input type="time" value={formState.gateClosingTime} onChange={(e) => setFormState((f) => ({ ...f, gateClosingTime: e.target.value }))} />
//               </FormControl>
//               {fieldErrors.gateClosingTime ? <p className="text-xs text-destructive">{fieldErrors.gateClosingTime}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Exam Start Time</FormLabel>
//               <FormControl>
//                 <Input type="time" value={formState.examTime} onChange={(e) => setFormState((f) => ({ ...f, examTime: e.target.value }))} />
//               </FormControl>
//               {fieldErrors.examTime ? <p className="text-xs text-destructive">{fieldErrors.examTime}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Exam End Time</FormLabel>
//               <FormControl>
//                 <Input type="time" value={formState.examEndTime} onChange={(e) => setFormState((f) => ({ ...f, examEndTime: e.target.value }))} />
//               </FormControl>
//               {fieldErrors.examEndTime ? <p className="text-xs text-destructive">{fieldErrors.examEndTime}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Instructions</FormLabel>
//               <FormControl>
//                 <Input
//                   value={formState.instructions?.join(", ") || ""}
//                   onChange={(e) =>
//                     setFormState((f) => ({
//                       ...f,
//                       instructions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
//                     }))
//                   }
//                   placeholder="Comma separated instructions"
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Status</FormLabel>
//               <FormControl>
//                 <select value={formState.status} onChange={(e) => setFormState((f) => ({ ...f, status: e.target.value }))} className="w-full rounded border p-2">
//                   <option value="active">Active</option>
//                   <option value="postponed">Postponed</option>
//                   <option value="completed">Completed</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Language</FormLabel>
//               <FormControl>
//                 <Input value={formState.language} onChange={(e) => setFormState((f) => ({ ...f, language: e.target.value }))} placeholder="Language" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Exam Type</FormLabel>
//               <FormControl>
//                 <Input value={formState.examType} onChange={(e) => setFormState((f) => ({ ...f, examType: e.target.value }))} placeholder="Exam Type (CBT, OMR, etc.)" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Max Capacity</FormLabel>
//               <FormControl>
//                 <Input
//                   type="number"
//                   value={formState.maxCapacity ?? ""}
//                   onChange={(e) => setFormState((f) => ({ ...f, maxCapacity: e.target.value ? Number(e.target.value) : undefined }))}
//                   placeholder="Max Capacity"
//                 />
//               </FormControl>
//               {fieldErrors.maxCapacity ? <p className="text-xs text-destructive">{fieldErrors.maxCapacity}</p> : null}
//               <FormMessage />
//             </FormItem>
//             <FormItem>
//               <FormLabel>Special Shift</FormLabel>
//               <FormControl>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={!!formState.isSpecialShift}
//                     onChange={(e) => setFormState((f) => ({ ...f, isSpecialShift: e.target.checked }))}
//                   />
//                   Special arrangement
//                 </label>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//             <FormItem className="md:col-span-2">
//               <FormLabel>Other Details</FormLabel>
//               <FormControl>
//                 <Input value={formState.otherDetails} onChange={(e) => setFormState((f) => ({ ...f, otherDetails: e.target.value }))} placeholder="Other Details" />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           </div>

//           <DialogFooter className="mt-4">
//             <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button type="button" onClick={handleDialogSave}>
//               {editIdx === null ? "Add" : "Save"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


import React, { useState, useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  PencilIcon,
  Trash2Icon,
  PlusCircleIcon,
  ClockIcon,
  CalendarIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  AlertCircleIcon,
  GlobeIcon,
  FileTextIcon,
  ShieldAlertIcon,
  InfoIcon,
  ListIcon,
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { FormControl, FormLabel } from "@/components/shadcn/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ShiftStatus = "active" | "postponed" | "completed" | "cancelled" | "upcoming" | "suspended";
export type ExamMode = "CBT" | "OMR" | "Hybrid" | "Descriptive" | "Skill-Test" | "Interview" | "Physical" | "Other";
export type MediumOfExam = "Hindi" | "English" | "Bilingual" | "Regional" | "Other";
export type ShiftSlot = "Morning" | "Afternoon" | "Evening" | "Full-Day";
export type PaperType = "Prelims" | "Mains" | "Tier-1" | "Tier-2" | "Tier-3" | "Tier-4" | "Stage-1" | "Stage-2" | "Final";

export type ExamShiftFormState = {
  // Core Identity
  shiftName: string;
  shiftCode: string;
  shiftSlot: ShiftSlot | "";
  paperType: PaperType | "";

  // Date & Timing
  shiftDate: string;
  reportingTime: string;
  gateClosingTime: string;
  examTime: string;
  examEndTime: string;
  durationMinutes: number | undefined;

  // Exam Configuration
  examMode: ExamMode | "";
  mediumOfExam: MediumOfExam | "";
  subjectsTested: string[];
  totalMarks: number | undefined;
  passingMarks: number | undefined;
  negativeMarking: boolean;
  negativeMarkingRatio: string;
  totalQuestions: number | undefined;

  // Candidates & Capacity
  maxCapacity: number | undefined;
  reportedCandidates: number | undefined;
  absenteesCount: number | undefined;
  centerCount: number | undefined;

  // Venue & Logistics
  venueCity: string;
  venueState: string;
  reportingCenter: string;
  admitCardRequired: boolean;
  idProofRequired: boolean;
  idProofTypes: string[];
  itemsAllowed: string[];
  itemsProhibited: string[];

  // Status & Flags
  status: ShiftStatus;
  isSpecialShift: boolean;
  isPWDShift: boolean;
  isScribeAllowed: boolean;
  hasCompensatoryTime: boolean;
  compensatoryMinutes: number | undefined;
  isReExam: boolean;
  reExamReason: string;

  // Content
  instructions: string[];
  importantNotes: string;
  otherDetails: string;
  internalRemarks: string;

  // Meta
  notificationRef: string;
  createdBy: string;
  lastModified: string;
};

type ExamShiftErrors = Partial<Record<keyof ExamShiftFormState, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAM_MODES: ExamMode[] = ["CBT", "OMR", "Hybrid", "Descriptive", "Skill-Test", "Interview", "Physical", "Other"];
const MEDIUMS: MediumOfExam[] = ["Hindi", "English", "Bilingual", "Regional", "Other"];
const SHIFT_SLOTS: ShiftSlot[] = ["Morning", "Afternoon", "Evening", "Full-Day"];
const PAPER_TYPES: PaperType[] = ["Prelims", "Mains", "Tier-1", "Tier-2", "Tier-3", "Tier-4", "Stage-1", "Stage-2", "Final"];
const STATUSES: { value: ShiftStatus; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "postponed", label: "Postponed", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "suspended", label: "Suspended", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
];
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli","Daman & Diu","Delhi",
  "Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];
const COMMON_ID_PROOFS = ["Aadhaar Card","Voter ID","PAN Card","Passport","Driving Licence","Bank Passbook","Ration Card","NREGA Job Card","Student ID"];
const COMMON_ITEMS_ALLOWED = ["Admit Card","ID Proof","Pen (Blue/Black)","Pencil","Eraser","Sharpener","Transparent Pouch","Water Bottle (Transparent)","Analogue Watch"];
const COMMON_ITEMS_PROHIBITED = ["Mobile Phone","Bluetooth Devices","Earphones","Smart Watch","Calculator","Textbooks","Notes","Electronic Gadgets","Wallet with Cards","Metallic Items"];

// ─── Default State ────────────────────────────────────────────────────────────

const createDefaultShiftState = (): ExamShiftFormState => ({
  shiftName: "", shiftCode: "", shiftSlot: "", paperType: "",
  shiftDate: "", reportingTime: "", gateClosingTime: "", examTime: "", examEndTime: "", durationMinutes: undefined,
  examMode: "", mediumOfExam: "", subjectsTested: [], totalMarks: undefined, passingMarks: undefined,
  negativeMarking: false, negativeMarkingRatio: "1/3", totalQuestions: undefined,
  maxCapacity: undefined, reportedCandidates: undefined, absenteesCount: undefined, centerCount: undefined,
  venueCity: "", venueState: "", reportingCenter: "", admitCardRequired: true, idProofRequired: true,
  idProofTypes: ["Aadhaar Card", "Voter ID", "PAN Card"],
  itemsAllowed: ["Admit Card", "ID Proof"],
  itemsProhibited: ["Mobile Phone", "Bluetooth Devices"],
  status: "active", isSpecialShift: false, isPWDShift: false, isScribeAllowed: false,
  hasCompensatoryTime: false, compensatoryMinutes: undefined, isReExam: false, reExamReason: "",
  instructions: [], importantNotes: "", otherDetails: "", internalRemarks: "",
  notificationRef: "", createdBy: "", lastModified: "",
});

const normalizeShift = (value: Partial<ExamShiftFormState> | undefined): ExamShiftFormState => {
  const base = createDefaultShiftState();
  const next = { ...base, ...(value || {}) };
  return {
    ...next,
    shiftName: String(next.shiftName ?? ""),
    shiftCode: String(next.shiftCode ?? ""),
    shiftDate: String(next.shiftDate ?? ""),
    reportingTime: String(next.reportingTime ?? ""),
    gateClosingTime: String(next.gateClosingTime ?? ""),
    examTime: String(next.examTime ?? ""),
    examEndTime: String(next.examEndTime ?? ""),
    instructions: Array.isArray(next.instructions) ? next.instructions.map(String).filter(Boolean) : [],
    subjectsTested: Array.isArray(next.subjectsTested) ? next.subjectsTested.map(String).filter(Boolean) : [],
    idProofTypes: Array.isArray(next.idProofTypes) ? next.idProofTypes.map(String).filter(Boolean) : [],
    itemsAllowed: Array.isArray(next.itemsAllowed) ? next.itemsAllowed.map(String).filter(Boolean) : [],
    itemsProhibited: Array.isArray(next.itemsProhibited) ? next.itemsProhibited.map(String).filter(Boolean) : [],
    status: (next.status as ShiftStatus) || "active",
    negativeMarking: Boolean(next.negativeMarking),
    isSpecialShift: Boolean(next.isSpecialShift),
    isPWDShift: Boolean(next.isPWDShift),
    isScribeAllowed: Boolean(next.isScribeAllowed),
    hasCompensatoryTime: Boolean(next.hasCompensatoryTime),
    isReExam: Boolean(next.isReExam),
    admitCardRequired: next.admitCardRequired !== false,
    idProofRequired: next.idProofRequired !== false,
    durationMinutes: next.durationMinutes ? Number(next.durationMinutes) : undefined,
    totalMarks: next.totalMarks ? Number(next.totalMarks) : undefined,
    passingMarks: next.passingMarks ? Number(next.passingMarks) : undefined,
    totalQuestions: next.totalQuestions ? Number(next.totalQuestions) : undefined,
    maxCapacity: next.maxCapacity ? Number(next.maxCapacity) : undefined,
    reportedCandidates: next.reportedCandidates ? Number(next.reportedCandidates) : undefined,
    absenteesCount: next.absenteesCount ? Number(next.absenteesCount) : undefined,
    centerCount: next.centerCount ? Number(next.centerCount) : undefined,
    compensatoryMinutes: next.compensatoryMinutes ? Number(next.compensatoryMinutes) : undefined,
  };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const compareTime = (a: string, b: string) => (!a || !b ? 0 : a.localeCompare(b));

const calcDuration = (start: string, end: string): string => {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return "";
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
};

const formatTime = (t: string) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
};

const getStatusConfig = (status: ShiftStatus) =>
  STATUSES.find((s) => s.value === status) || STATUSES[0];

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4">
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-indigo-600" />
      <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-700">{title}</h4>
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
  </div>
);

const FieldRow = ({ children, span = false }: { children: React.ReactNode; span?: boolean }) => (
  <div className={span ? "md:col-span-2" : ""}>{children}</div>
);

const FieldLabel = ({ children, required, tooltip }: { children: React.ReactNode; required?: boolean; tooltip?: string }) => (
  <div className="mb-1 flex items-center gap-1">
    <FormLabel className="text-xs font-medium text-gray-700">{children}</FormLabel>
    {required && <span className="text-red-500">*</span>}
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-3 w-3 cursor-help text-gray-400" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 flex items-center gap-1 text-xs text-red-600"><AlertCircleIcon className="h-3 w-3" />{msg}</p> : null;

const TagInput = ({
  value, onChange, placeholder, suggestions,
}: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[] }) => {
  const [input, setInput] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const filtered = suggestions?.filter((s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase())) || [];
  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
    setShowSugg(false);
  };
  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));
  return (
    <div className="relative">
      <div className="flex min-h-9 flex-wrap gap-1 rounded-md border bg-white p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="text-indigo-500 hover:text-indigo-800">×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSugg(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); input.trim() && add(input); } }}
          onFocus={() => setShowSugg(true)}
          onBlur={() => setTimeout(() => setShowSugg(false), 150)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-16 flex-1 bg-transparent text-xs outline-none placeholder:text-gray-400"
        />
      </div>
      {showSugg && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {filtered.map((s) => (
            <button key={s} type="button" onMouseDown={() => add(s)} className="w-full px-3 py-1.5 text-left text-xs hover:bg-indigo-50">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
    <span className="text-xs text-gray-700">{label}</span>
  </label>
);

// ─── Shift Card ───────────────────────────────────────────────────────────────

const ShiftCard = ({
  shift, idx, onEdit, onRemove, onDuplicate, expanded, onToggleExpand,
}: {
  shift: ExamShiftFormState;
  idx: number;
  onEdit: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) => {
  const statusCfg = getStatusConfig(shift.status);
  const duration = calcDuration(shift.examTime, shift.examEndTime);
  const attendance = shift.reportedCandidates && shift.maxCapacity
    ? Math.round((shift.reportedCandidates / shift.maxCapacity) * 100)
    : null;

  return (
    <div className={`rounded-xl border-2 bg-white shadow-sm transition-all ${shift.status === "cancelled" ? "border-red-200 opacity-70" : shift.status === "postponed" ? "border-amber-200" : "border-gray-200 hover:border-indigo-300 hover:shadow-md"}`}>
      <div className="flex items-start gap-3 p-4">
        {/* Index Badge */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          {idx + 1}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 truncate">{shift.shiftName || `Shift ${idx + 1}`}</span>
            {shift.shiftCode && <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{shift.shiftCode}</span>}
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            {shift.shiftSlot && <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{shift.shiftSlot}</span>}
            {shift.paperType && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{shift.paperType}</span>}
            {shift.isSpecialShift && <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">⭐ Special</span>}
            {shift.isPWDShift && <span className="rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-700">♿ PWD</span>}
            {shift.isReExam && <span className="rounded bg-rose-100 px-2 py-0.5 text-xs text-rose-700">🔄 Re-Exam</span>}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
            {shift.shiftDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-indigo-400" />
                {new Date(shift.shiftDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
            {shift.examTime && (
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-indigo-400" />
                {formatTime(shift.examTime)}{shift.examEndTime ? ` – ${formatTime(shift.examEndTime)}` : ""}
                {duration && <span className="ml-1 text-gray-400">({duration})</span>}
              </span>
            )}
            {shift.reportingTime && (
              <span className="flex items-center gap-1 text-gray-400">
                Reporting: {formatTime(shift.reportingTime)}
              </span>
            )}
            {shift.examMode && <span className="flex items-center gap-1"><FileTextIcon className="h-3 w-3 text-indigo-400" />{shift.examMode}</span>}
            {shift.mediumOfExam && <span className="flex items-center gap-1"><GlobeIcon className="h-3 w-3 text-indigo-400" />{shift.mediumOfExam}</span>}
            {shift.venueCity && <span className="text-gray-400">{shift.venueCity}{shift.venueState ? `, ${shift.venueState}` : ""}</span>}
          </div>

          {/* Stats Row */}
          {(shift.maxCapacity || shift.totalMarks || shift.totalQuestions) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {shift.maxCapacity && (
                <div className="flex items-center gap-1 text-xs">
                  <UsersIcon className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-500">Cap:</span>
                  <span className="font-medium">{shift.maxCapacity.toLocaleString("en-IN")}</span>
                  {attendance !== null && (
                    <span className={`ml-1 ${attendance >= 90 ? "text-red-500" : attendance >= 70 ? "text-amber-500" : "text-green-500"}`}>
                      ({attendance}% filled)
                    </span>
                  )}
                </div>
              )}
              {shift.totalMarks && (
                <div className="text-xs"><span className="text-gray-500">Marks:</span> <span className="font-medium">{shift.totalMarks}</span></div>
              )}
              {shift.totalQuestions && (
                <div className="text-xs"><span className="text-gray-500">Qs:</span> <span className="font-medium">{shift.totalQuestions}</span></div>
              )}
              {shift.negativeMarking && (
                <span className="text-xs text-red-600">⚠ Neg. Marking ({shift.negativeMarkingRatio})</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={onDuplicate}>
                  <CopyIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Duplicate</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-indigo-600" onClick={onEdit}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-red-600" onClick={onRemove}>
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
          <button type="button" className="text-gray-400 hover:text-gray-600 ml-1" onClick={onToggleExpand}>
            {expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-600 space-y-2 bg-gray-50/50">
          {shift.instructions.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Instructions: </span>
              <span>{shift.instructions.join(" • ")}</span>
            </div>
          )}
          {shift.idProofTypes.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Accepted ID Proofs: </span>
              <span>{shift.idProofTypes.join(", ")}</span>
            </div>
          )}
          {shift.itemsAllowed.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700 text-green-700">✓ Allowed: </span>
              <span>{shift.itemsAllowed.join(", ")}</span>
            </div>
          )}
          {shift.itemsProhibited.length > 0 && (
            <div>
              <span className="font-semibold text-red-600">✗ Prohibited: </span>
              <span>{shift.itemsProhibited.join(", ")}</span>
            </div>
          )}
          {shift.importantNotes && (
            <div>
              <span className="font-semibold text-amber-700">📢 Notes: </span>
              <span>{shift.importantNotes}</span>
            </div>
          )}
          {(shift.isScribeAllowed || shift.hasCompensatoryTime || shift.isPWDShift) && (
            <div className="flex flex-wrap gap-2">
              {shift.isPWDShift && <span className="rounded bg-teal-50 border border-teal-200 px-2 py-0.5 text-teal-700">PWD Shift</span>}
              {shift.isScribeAllowed && <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-blue-700">Scribe Allowed</span>}
              {shift.hasCompensatoryTime && <span className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-purple-700">+{shift.compensatoryMinutes}m Compensatory</span>}
            </div>
          )}
          {shift.notificationRef && (
            <div><span className="font-semibold text-gray-700">Notification Ref: </span><span className="font-mono">{shift.notificationRef}</span></div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ExamShiftsField({ name = "examShifts" }: { name?: string }) {
  const { control, getValues } = useFormContext();
  const { fields, append, update, remove } = useFieldArray({ control, name });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [formState, setFormState] = useState<ExamShiftFormState>(createDefaultShiftState);
  const [fieldErrors, setFieldErrors] = useState<ExamShiftErrors>({});
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShiftStatus | "all">("all");
  const [activeTab, setActiveTab] = useState<"core" | "exam" | "candidates" | "venue" | "rules" | "meta">("core");

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateShift = useCallback((candidate: ExamShiftFormState): ExamShiftErrors => {
    const errors: ExamShiftErrors = {};
    if (!candidate.shiftName.trim()) errors.shiftName = "Shift name is required";
    if (!candidate.shiftDate) errors.shiftDate = "Shift date is required";
    if (!candidate.reportingTime) errors.reportingTime = "Reporting time is required";
    if (!candidate.gateClosingTime) errors.gateClosingTime = "Gate closing time is required";
    if (!candidate.examTime) errors.examTime = "Exam start time is required";
    if (!candidate.examMode) errors.examMode = "Exam mode is required";
    if (!candidate.mediumOfExam) errors.mediumOfExam = "Medium of exam is required";

    if (candidate.reportingTime && candidate.gateClosingTime && compareTime(candidate.reportingTime, candidate.gateClosingTime) > 0)
      errors.gateClosingTime = "Gate closing time must be after reporting time";
    if (candidate.gateClosingTime && candidate.examTime && compareTime(candidate.gateClosingTime, candidate.examTime) > 0)
      errors.examTime = "Exam start time must be after gate closing time";
    if (candidate.examEndTime && candidate.examTime && compareTime(candidate.examEndTime, candidate.examTime) <= 0)
      errors.examEndTime = "Exam end time must be after exam start time";
    if (candidate.maxCapacity !== undefined && candidate.maxCapacity < 0)
      errors.maxCapacity = "Cannot be negative";
    if (candidate.passingMarks !== undefined && candidate.totalMarks !== undefined && candidate.passingMarks > candidate.totalMarks)
      errors.passingMarks = "Cannot exceed total marks";
    if (candidate.isReExam && !candidate.reExamReason.trim())
      errors.reExamReason = "Please provide re-exam reason";
    if (candidate.hasCompensatoryTime && (!candidate.compensatoryMinutes || candidate.compensatoryMinutes <= 0))
      errors.compensatoryMinutes = "Please enter compensatory minutes";

    const normalizedName = candidate.shiftName.trim().toLowerCase();
    const duplicate = fields.some((_, idx) => {
      if (editIdx !== null && idx === editIdx) return false;
      const existing = normalizeShift(getValues(`${name}.${idx}`));
      return existing.shiftDate === candidate.shiftDate && existing.shiftName.trim().toLowerCase() === normalizedName;
    });
    if (duplicate) errors.shiftName = "A shift with same name and date already exists";

    return errors;
  }, [fields, editIdx, getValues, name]);

  // ── Dialog Handlers ─────────────────────────────────────────────────────────
  const openAddDialog = () => {
    setEditIdx(null);
    setFormState(createDefaultShiftState());
    setFieldErrors({});
    setActiveTab("core");
    setDialogOpen(true);
  };

  const openEditDialog = (idx: number) => {
    setEditIdx(idx);
    setFormState(normalizeShift(getValues(`${name}.${idx}`)));
    setFieldErrors({});
    setActiveTab("core");
    setDialogOpen(true);
  };

  const handleDuplicate = (idx: number) => {
    const src = normalizeShift(getValues(`${name}.${idx}`));
    append({ ...src, shiftName: `${src.shiftName} (Copy)`, shiftCode: "", shiftDate: "" });
  };

  const handleDialogSave = () => {
    const normalized = normalizeShift(formState);
    // Auto-compute duration
    if (normalized.examTime && normalized.examEndTime) {
      const dur = calcDuration(normalized.examTime, normalized.examEndTime);
      if (dur) {
        const [h, m] = dur.split("h ").map((s) => parseInt(s));
        normalized.durationMinutes = (h || 0) * 60 + (m || 0);
      }
    }
    normalized.lastModified = new Date().toISOString();
    const errors = validateShift(normalized);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (editIdx === null) append(normalized);
    else update(editIdx, normalized);
    setDialogOpen(false);
  };

  const set = useCallback((key: keyof ExamShiftFormState) => (val: unknown) =>
    setFormState((f) => ({ ...f, [key]: val })), []);

  const setEvent = useCallback((key: keyof ExamShiftFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormState((f) => ({ ...f, [key]: e.target.value })), []);

  // ── Filtered & stats ────────────────────────────────────────────────────────
  const allShifts = useMemo(() => fields.map((_, idx) => normalizeShift(getValues(`${name}.${idx}`))), [fields, getValues, name]);

  const filteredIndexes = useMemo(() => {
    return fields.map((_, idx) => idx).filter((idx) => {
      const s = allShifts[idx];
      const matchSearch = !searchQuery || s.shiftName.toLowerCase().includes(searchQuery.toLowerCase()) || s.shiftCode.toLowerCase().includes(searchQuery.toLowerCase()) || s.venueCity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fields, allShifts, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: fields.length,
    active: allShifts.filter((s) => s.status === "active").length,
    cancelled: allShifts.filter((s) => s.status === "cancelled").length,
    totalCapacity: allShifts.reduce((acc, s) => acc + (s.maxCapacity || 0), 0),
  }), [allShifts, fields.length]);

  const toggleExpand = (idx: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // ── Tab config ───────────────────────────────────────────────────────────────
  const tabs = [
    { id: "core", label: "Core Details", icon: CalendarIcon, hasError: !!(fieldErrors.shiftName || fieldErrors.shiftDate || fieldErrors.reportingTime || fieldErrors.gateClosingTime || fieldErrors.examTime || fieldErrors.examEndTime) },
    { id: "exam", label: "Exam Config", icon: FileTextIcon, hasError: !!(fieldErrors.examMode || fieldErrors.mediumOfExam || fieldErrors.totalMarks || fieldErrors.passingMarks) },
    { id: "candidates", label: "Candidates", icon: UsersIcon, hasError: !!(fieldErrors.maxCapacity) },
    { id: "venue", label: "Venue & Access", icon: GlobeIcon, hasError: false },
    { id: "rules", label: "Rules & Flags", icon: ShieldAlertIcon, hasError: !!(fieldErrors.reExamReason || fieldErrors.compensatoryMinutes) },
    { id: "meta", label: "Meta / Notes", icon: ListIcon, hasError: false },
  ] as const;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <FormLabel className="text-base font-semibold text-gray-900">Exam Shifts</FormLabel>
          <p className="text-xs text-gray-500 mt-0.5">Manage date-wise exam shifts, timings and logistics</p>
        </div>
        <Button type="button" onClick={openAddDialog} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <PlusCircleIcon className="h-4 w-4" />
          Add Shift
        </Button>
      </div>

      {/* Stats Bar */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total Shifts", value: stats.total, color: "text-indigo-600" },
            { label: "Active", value: stats.active, color: "text-emerald-600" },
            { label: "Cancelled", value: stats.cancelled, color: "text-red-600" },
            { label: "Total Capacity", value: stats.totalCapacity.toLocaleString("en-IN"), color: "text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-white p-3 text-center shadow-sm">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      {fields.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <SearchIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shifts..."
              className="h-8 w-full rounded-md border pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1">
            <FilterIcon className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShiftStatus | "all")}
              className="h-8 rounded-md border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Shift Cards */}
      {fields.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-sm font-medium text-gray-500">No exam shifts added yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Shift" to configure the first shift</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIndexes.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No shifts match the current filter</p>
          ) : (
            filteredIndexes.map((idx) => (
              <ShiftCard
                key={fields[idx].id}
                shift={allShifts[idx]}
                idx={idx}
                onEdit={() => openEditDialog(idx)}
                onRemove={() => remove(idx)}
                onDuplicate={() => handleDuplicate(idx)}
                expanded={expandedCards.has(idx)}
                onToggleExpand={() => toggleExpand(idx)}
              />
            ))
          )}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b bg-gradient-to-r from-indigo-50 to-white">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editIdx === null ? "Add New Exam Shift" : `Edit Shift — ${formState.shiftName || "Unnamed"}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Configure all details for this exam shift. Fields marked * are mandatory.
            </DialogDescription>
          </DialogHeader>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b bg-white px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.hasError && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "60vh" }}>

            {/* TAB: Core Details */}
            {activeTab === "core" && (
              <div className="space-y-4">
                <FieldSection title="Identity" icon={FileTextIcon}>
                  <FieldRow>
                    <FieldLabel required tooltip="Human-readable name like 'Morning Shift 1' or 'Afternoon Shift A'">Shift Name</FieldLabel>
                    <FormControl><Input value={formState.shiftName} onChange={setEvent("shiftName")} placeholder="e.g. Morning Shift 1" className="h-8 text-sm" /></FormControl>
                    <FieldError msg={fieldErrors.shiftName} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel tooltip="Short alphanumeric code, e.g. MS1, AS2">Shift Code</FieldLabel>
                    <FormControl><Input value={formState.shiftCode} onChange={setEvent("shiftCode")} placeholder="e.g. MS1" className="h-8 text-sm font-mono" /></FormControl>
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Shift Slot</FieldLabel>
                    <select value={formState.shiftSlot} onChange={setEvent("shiftSlot")} className="h-8 w-full rounded-md border text-sm px-2">
                      <option value="">Select slot</option>
                      {SHIFT_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Paper / Stage Type</FieldLabel>
                    <select value={formState.paperType} onChange={setEvent("paperType")} className="h-8 w-full rounded-md border text-sm px-2">
                      <option value="">Select type</option>
                      {PAPER_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Date & Timings" icon={ClockIcon}>
                  <FieldRow>
                    <FieldLabel required>Shift Date</FieldLabel>
                    <Input type="date" value={formState.shiftDate} onChange={setEvent("shiftDate")} className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.shiftDate} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel required tooltip="Time candidates must arrive at the exam centre">Reporting Time</FieldLabel>
                    <Input type="time" value={formState.reportingTime} onChange={setEvent("reportingTime")} className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.reportingTime} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel required tooltip="Time after which no candidate is admitted">Gate Closing Time</FieldLabel>
                    <Input type="time" value={formState.gateClosingTime} onChange={setEvent("gateClosingTime")} className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.gateClosingTime} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel required>Exam Start Time</FieldLabel>
                    <Input type="time" value={formState.examTime} onChange={setEvent("examTime")} className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.examTime} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Exam End Time</FieldLabel>
                    <Input type="time" value={formState.examEndTime} onChange={setEvent("examEndTime")} className="h-8 text-sm" />
                    {formState.examTime && formState.examEndTime && (
                      <p className="mt-1 text-xs text-indigo-600 font-medium">
                        ⏱ Duration: {calcDuration(formState.examTime, formState.examEndTime) || "Invalid"}
                      </p>
                    )}
                    <FieldError msg={fieldErrors.examEndTime} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Status</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button key={s.value} type="button" onClick={() => set("status")(s.value)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${formState.status === s.value ? s.color + " ring-2 ring-offset-1 ring-indigo-400" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                </FieldSection>
              </div>
            )}

            {/* TAB: Exam Config */}
            {activeTab === "exam" && (
              <div className="space-y-4">
                <FieldSection title="Exam Format" icon={FileTextIcon}>
                  <FieldRow>
                    <FieldLabel required>Exam Mode</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {EXAM_MODES.map((m) => (
                        <button key={m} type="button" onClick={() => set("examMode")(m)}
                          className={`rounded border px-2.5 py-1 text-xs font-medium transition-all ${formState.examMode === m ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <FieldError msg={fieldErrors.examMode} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel required>Medium of Exam</FieldLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {MEDIUMS.map((m) => (
                        <button key={m} type="button" onClick={() => set("mediumOfExam")(m)}
                          className={`rounded border px-2.5 py-1 text-xs font-medium transition-all ${formState.mediumOfExam === m ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    <FieldError msg={fieldErrors.mediumOfExam} />
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Subjects & Syllabus" icon={ListIcon}>
                  <FieldRow span>
                    <FieldLabel tooltip="Add subjects being tested in this shift">Subjects Tested</FieldLabel>
                    <TagInput value={formState.subjectsTested} onChange={set("subjectsTested")}
                      placeholder="Type subject and press Enter"
                      suggestions={["General Intelligence","Quantitative Aptitude","English Language","General Awareness","Reasoning","Mathematics","General Studies","Computer Knowledge","Hindi","Physics","Chemistry"]} />
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Marks & Questions" icon={FileTextIcon}>
                  <FieldRow>
                    <FieldLabel>Total Questions</FieldLabel>
                    <Input type="number" value={formState.totalQuestions ?? ""} onChange={(e) => set("totalQuestions")(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 100" className="h-8 text-sm" />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Total Marks</FieldLabel>
                    <Input type="number" value={formState.totalMarks ?? ""} onChange={(e) => set("totalMarks")(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 200" className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.totalMarks} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Passing Marks</FieldLabel>
                    <Input type="number" value={formState.passingMarks ?? ""} onChange={(e) => set("passingMarks")(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 90" className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.passingMarks} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel tooltip="Marks deducted per wrong answer">Negative Marking</FieldLabel>
                    <div className="space-y-2">
                      <Toggle checked={formState.negativeMarking} onChange={set("negativeMarking")} label="Negative marking applies" />
                      {formState.negativeMarking && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Ratio:</span>
                          <div className="flex gap-1">
                            {["1/4", "1/3", "0.25", "0.33", "0.5", "1"].map((r) => (
                              <button key={r} type="button" onClick={() => set("negativeMarkingRatio")(r)}
                                className={`rounded border px-2 py-0.5 text-xs ${formState.negativeMarkingRatio === r ? "bg-red-100 border-red-400 text-red-700" : "border-gray-200 text-gray-600"}`}>
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FieldRow>
                </FieldSection>
              </div>
            )}

            {/* TAB: Candidates */}
            {activeTab === "candidates" && (
              <div className="space-y-4">
                <FieldSection title="Capacity & Attendance" icon={UsersIcon}>
                  <FieldRow>
                    <FieldLabel tooltip="Total seats available for this shift">Max Capacity</FieldLabel>
                    <Input type="number" value={formState.maxCapacity ?? ""} onChange={(e) => set("maxCapacity")(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 50000" className="h-8 text-sm" />
                    <FieldError msg={fieldErrors.maxCapacity} />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Reported Candidates</FieldLabel>
                    <Input type="number" value={formState.reportedCandidates ?? ""} onChange={(e) => set("reportedCandidates")(e.target.value ? Number(e.target.value) : undefined)} placeholder="Actual attendance" className="h-8 text-sm" />
                    {formState.reportedCandidates && formState.maxCapacity && (
                      <p className="mt-1 text-xs text-indigo-600">Attendance: {Math.round((formState.reportedCandidates / formState.maxCapacity) * 100)}%</p>
                    )}
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Absentees Count</FieldLabel>
                    <Input type="number" value={formState.absenteesCount ?? ""} onChange={(e) => set("absenteesCount")(e.target.value ? Number(e.target.value) : undefined)} placeholder="No. of absentees" className="h-8 text-sm" />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel tooltip="Number of examination centres active for this shift">No. of Centres</FieldLabel>
                    <Input type="number" value={formState.centerCount ?? ""} onChange={(e) => set("centerCount")(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 245" className="h-8 text-sm" />
                  </FieldRow>
                </FieldSection>
              </div>
            )}

            {/* TAB: Venue & Access */}
            {activeTab === "venue" && (
              <div className="space-y-4">
                <FieldSection title="Venue Details" icon={GlobeIcon}>
                  <FieldRow>
                    <FieldLabel>City / District</FieldLabel>
                    <Input value={formState.venueCity} onChange={setEvent("venueCity")} placeholder="e.g. New Delhi, Patna" className="h-8 text-sm" />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>State / UT</FieldLabel>
                    <select value={formState.venueState} onChange={setEvent("venueState")} className="h-8 w-full rounded-md border text-sm px-2">
                      <option value="">Select State / UT</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel tooltip="Primary reporting/exam centre name or address">Reporting Centre</FieldLabel>
                    <Input value={formState.reportingCenter} onChange={setEvent("reportingCenter")} placeholder="Centre name or address" className="h-8 text-sm" />
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Entry Requirements" icon={ShieldAlertIcon}>
                  <FieldRow span>
                    <div className="flex flex-wrap gap-4">
                      <Toggle checked={formState.admitCardRequired} onChange={set("admitCardRequired")} label="Admit card mandatory" />
                      <Toggle checked={formState.idProofRequired} onChange={set("idProofRequired")} label="Photo ID mandatory" />
                    </div>
                  </FieldRow>
                  {formState.idProofRequired && (
                    <FieldRow span>
                      <FieldLabel>Accepted ID Proof Types</FieldLabel>
                      <TagInput value={formState.idProofTypes} onChange={set("idProofTypes")} placeholder="Add ID proof type" suggestions={COMMON_ID_PROOFS} />
                    </FieldRow>
                  )}
                </FieldSection>

                <FieldSection title="Items Policy" icon={ListIcon}>
                  <FieldRow span>
                    <FieldLabel>Items Allowed Inside Hall</FieldLabel>
                    <TagInput value={formState.itemsAllowed} onChange={set("itemsAllowed")} placeholder="Add allowed item" suggestions={COMMON_ITEMS_ALLOWED} />
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel>Prohibited Items</FieldLabel>
                    <TagInput value={formState.itemsProhibited} onChange={set("itemsProhibited")} placeholder="Add prohibited item" suggestions={COMMON_ITEMS_PROHIBITED} />
                  </FieldRow>
                </FieldSection>
              </div>
            )}

            {/* TAB: Rules & Flags */}
            {activeTab === "rules" && (
              <div className="space-y-4">
                <FieldSection title="Accessibility Provisions" icon={ShieldAlertIcon}>
                  <FieldRow span>
                    <div className="grid grid-cols-1 gap-3">
                      <Toggle checked={formState.isSpecialShift} onChange={set("isSpecialShift")} label="Special shift (requires extra coordination)" />
                      <Toggle checked={formState.isPWDShift} onChange={set("isPWDShift")} label="PWD shift (for Persons with Disabilities)" />
                      <Toggle checked={formState.isScribeAllowed} onChange={set("isScribeAllowed")} label="Scribe / Writer allowed" />
                    </div>
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel tooltip="Extra time given to PWD candidates">Compensatory Time</FieldLabel>
                    <div className="space-y-2">
                      <Toggle checked={formState.hasCompensatoryTime} onChange={set("hasCompensatoryTime")} label="Grant compensatory time" />
                      {formState.hasCompensatoryTime && (
                        <div className="flex items-center gap-2">
                          <Input type="number" value={formState.compensatoryMinutes ?? ""} onChange={(e) => set("compensatoryMinutes")(e.target.value ? Number(e.target.value) : undefined)} placeholder="Minutes" className="h-7 w-24 text-sm" />
                          <span className="text-xs text-gray-500">minutes extra</span>
                        </div>
                      )}
                    </div>
                    <FieldError msg={fieldErrors.compensatoryMinutes} />
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Re-Exam Flags" icon={RefreshCwIcon}>
                  <FieldRow span>
                    <Toggle checked={formState.isReExam} onChange={set("isReExam")} label="This is a Re-Examination" />
                    {formState.isReExam && (
                      <div className="mt-2">
                        <FieldLabel required>Reason for Re-Exam</FieldLabel>
                        <Input value={formState.reExamReason} onChange={setEvent("reExamReason")} placeholder="e.g. Paper leak in original shift" className="h-8 text-sm mt-1" />
                        <FieldError msg={fieldErrors.reExamReason} />
                      </div>
                    )}
                  </FieldRow>
                </FieldSection>
              </div>
            )}

            {/* TAB: Meta & Notes */}
            {activeTab === "meta" && (
              <div className="space-y-4">
                <FieldSection title="Instructions & Notes" icon={ListIcon}>
                  <FieldRow span>
                    <FieldLabel tooltip="Key instructions shown to candidates on admit card or website">Candidate Instructions</FieldLabel>
                    <TagInput value={formState.instructions} onChange={set("instructions")} placeholder="Type instruction and press Enter"
                      suggestions={["Reach 30 min early","Carry original ID proof","No electronic devices allowed","Biometric verification mandatory","Dress code applicable","Rough sheets will be provided"]} />
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel>Important Notes / Announcements</FieldLabel>
                    <textarea value={formState.importantNotes} onChange={(e) => set("importantNotes")(e.target.value)}
                      placeholder="Any important announcements or notes for this shift..."
                      rows={3} className="w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel>Other Details (public)</FieldLabel>
                    <Input value={formState.otherDetails} onChange={setEvent("otherDetails")} placeholder="Any other public-facing details" className="h-8 text-sm" />
                  </FieldRow>
                  <FieldRow span>
                    <FieldLabel tooltip="Internal remarks not shown to candidates">Internal Remarks</FieldLabel>
                    <Input value={formState.internalRemarks} onChange={setEvent("internalRemarks")} placeholder="Internal remarks (not shown publicly)" className="h-8 text-sm bg-yellow-50 border-yellow-200" />
                  </FieldRow>
                </FieldSection>

                <FieldSection title="Reference & Audit" icon={FileTextIcon}>
                  <FieldRow>
                    <FieldLabel tooltip="Official notification or circular reference number">Notification Reference</FieldLabel>
                    <Input value={formState.notificationRef} onChange={setEvent("notificationRef")} placeholder="e.g. SSC/CGL/2024/Notif-01" className="h-8 text-sm font-mono" />
                  </FieldRow>
                  <FieldRow>
                    <FieldLabel>Created By</FieldLabel>
                    <Input value={formState.createdBy} onChange={setEvent("createdBy")} placeholder="Admin name / designation" className="h-8 text-sm" />
                  </FieldRow>
                </FieldSection>
              </div>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {Object.keys(fieldErrors).length > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertCircleIcon className="h-3.5 w-3.5" />
                  {Object.keys(fieldErrors).length} error(s) found
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="button" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleDialogSave}>
                {editIdx === null ? "Add Shift" : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}