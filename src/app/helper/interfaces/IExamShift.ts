import { ExamMode, ExamShift, ExamShiftSchema, MediumOfExam, NegativeMarkingRatio, PaperType, ShiftSlot, ShiftStatus } from "@/lib/schemas/ExamShiftSchema";

export interface IExamShift {
  // Identity
  id?:        string;          // UUID — absent on create
  shiftName:  string;
  shiftCode?: string;
  shiftSlot?: ShiftSlot;
  paperType?: PaperType;

  // Date
  shiftDate: string;           // YYYY-MM-DD

  // Timings
  reportingTime:   string;     // HH:MM
  gateClosingTime: string;     // HH:MM
  examTime:        string;     // HH:MM
  examEndTime?:    string;     // HH:MM
  durationMinutes?: number;

  // Exam configuration
  examMode:       ExamMode;
  mediumOfExam:   MediumOfExam;
  subjectsTested: string[];

  // Scoring
  totalQuestions?:      number;
  totalMarks?:          number;
  passingMarks?:        number;
  negativeMarking:      boolean;
  negativeMarkingRatio: NegativeMarkingRatio;

  // Candidates
  maxCapacity?:        number;
  reportedCandidates?: number;
  absenteesCount?:     number;
  centerCount?:        number;

  // Venue
  venueCity?:       string;
  venueState?:      string;
  reportingCenter?: string;

  // Entry policy
  admitCardRequired: boolean;
  idProofRequired:   boolean;
  idProofTypes:      string[];
  itemsAllowed:      string[];
  itemsProhibited:   string[];

  // Status & flags
  status:         ShiftStatus;
  isSpecialShift: boolean;

  // Accessibility
  isPWDShift:          boolean;
  isScribeAllowed:     boolean;
  hasCompensatoryTime: boolean;
  compensatoryMinutes?: number;

  // Re-exam
  isReExam:     boolean;
  reExamReason?: string;

  // Content
  instructions:    string[];
  importantNotes?: string;
  otherDetails?:   string;
  internalRemarks?: string;

  // Audit / meta
  notificationRef?: string;
  createdBy?:       string;
  lastModified?:    string;    // ISO 8601
  createdAt?:       string;    // ISO 8601
}

/** Create payload — id absent, DB fills it */
export interface IExamShiftCreate extends Omit<IExamShift, "id" | "lastModified" | "createdAt"> {}

/** Update payload — id mandatory, everything else partial */
export interface IExamShiftUpdate extends Partial<IExamShift> {
  id: string;
}

/** Query / filter params */
export interface IExamShiftQuery {
  status?:    ShiftStatus;
  examMode?:  ExamMode;
  paperType?: PaperType;
  shiftDate?: string;
  dateFrom?:  string;
  dateTo?:    string;
  search?:    string;
  examId?:    string;
  page?:      number;
  limit?:     number;
  sortBy?:    "shiftDate" | "shiftName" | "examTime" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

/** Paginated list response */
export interface IExamShiftsListResponse {
  success: true;
  data:    IExamShift[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

/** Single-item response */
export interface IExamShiftResponse {
  success: true;
  data:    IExamShift;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Safe default factory — matches all Zod .default() values */
export const createDefaultExamShift = (): IExamShiftCreate => ({
  shiftName:           "",
  shiftDate:           "",
  reportingTime:       "",
  gateClosingTime:     "",
  examTime:            "",
  examMode:            "CBT",
  mediumOfExam:        "Bilingual",
  subjectsTested:      [],
  negativeMarking:     false,
  negativeMarkingRatio:"1/3",
  admitCardRequired:   true,
  idProofRequired:     true,
  idProofTypes:        ["Aadhaar Card", "Voter ID", "PAN Card"],
  itemsAllowed:        ["Admit Card", "ID Proof"],
  itemsProhibited:     ["Mobile Phone", "Bluetooth Devices"],
  status:              "active",
  isSpecialShift:      false,
  isPWDShift:          false,
  isScribeAllowed:     false,
  hasCompensatoryTime: false,
  isReExam:            false,
  instructions:        [],
});

/**
 * Compute exam duration in minutes from HH:MM strings.
 * Returns undefined if either time is missing or end <= start.
 */
export const computeDurationMinutes = (
  examTime: string,
  examEndTime?: string
): number | undefined => {
  if (!examTime || !examEndTime) return undefined;
  const [sh, sm] = examTime.split(":").map(Number);
  const [eh, em] = examEndTime.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff : undefined;
};

/**
 * Compute attendance percentage.
 * Returns null when data is insufficient.
 */
export const computeAttendancePct = (
  reported?: number,
  capacity?: number
): number | null => {
  if (!reported || !capacity || capacity === 0) return null;
  return Math.round((reported / capacity) * 100);
};

/**
 * Narrow a raw unknown value into a validated ExamShift.
 * Throws a descriptive error on failure.
 */
export const parseExamShift = (raw: unknown): ExamShift => {
  const result = ExamShiftSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `[${i.path.join(".")}] ${i.message}`)
      .join("; ");
    throw new Error(`ExamShift validation failed: ${messages}`);
  }
  return result.data;
};