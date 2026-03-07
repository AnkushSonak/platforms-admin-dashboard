/**
 * examShift.schema.ts
 *
 * Single source of truth for Exam Shift data.
 * Works on both frontend (React / Next.js) and backend (Node / Express / NestJS).
 *
 * Usage:
 *   import { ExamShiftSchema, type ExamShift } from "@/schemas/examShift.schema";
 *
 *   // Validate & parse (throws ZodError on failure)
 *   const shift = ExamShiftSchema.parse(rawInput);
 *
 *   // Safe parse (returns { success, data, error })
 *   const result = ExamShiftSchema.safeParse(rawInput);
 *
 *   // Infer the type anywhere
 *   type MyShift = ExamShift;
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENUM SCHEMAS  (re-export as TypeScript union types too)
// ─────────────────────────────────────────────────────────────────────────────

export const ShiftStatusSchema = z.enum([
  "active",
  "upcoming",
  "completed",
  "postponed",
  "suspended",
  "cancelled",
]);
export type ShiftStatus = z.infer<typeof ShiftStatusSchema>;

export const ExamModeSchema = z.enum([
  "CBT",          // Computer Based Test
  "OMR",          // Optical Mark Recognition (paper)
  "Hybrid",       // Mixed CBT + OMR
  "Descriptive",  // Written / essay
  "Skill-Test",   // Typing / data-entry
  "Interview",
  "Physical",     // PET / PST
  "Other",
]);
export type ExamMode = z.infer<typeof ExamModeSchema>;

export const MediumOfExamSchema = z.enum([
  "Hindi",
  "English",
  "Bilingual",    // Both Hindi & English
  "Regional",     // State-specific language
  "Other",
]);
export type MediumOfExam = z.infer<typeof MediumOfExamSchema>;

export const ShiftSlotSchema = z.enum([
  "Morning",
  "Afternoon",
  "Evening",
  "Full-Day",
]);
export type ShiftSlot = z.infer<typeof ShiftSlotSchema>;

export const PaperTypeSchema = z.enum([
  "Prelims",
  "Mains",
  "Tier-1",
  "Tier-2",
  "Tier-3",
  "Tier-4",
  "Stage-1",
  "Stage-2",
  "Final",
]);
export type PaperType = z.infer<typeof PaperTypeSchema>;

export const NegativeMarkingRatioSchema = z.enum([
  "1/4",
  "1/3",
  "0.25",
  "0.33",
  "0.5",
  "1",
]);
export type NegativeMarkingRatio = z.infer<typeof NegativeMarkingRatioSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 2. HELPER / REUSABLE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/** HH:MM  (24-hour) */
const TimeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be a valid 24-hour time (HH:MM)");

/** YYYY-MM-DD */
const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)");

/** Non-empty, trimmed string */
const NonEmptyString = z.string().trim().min(1, "Cannot be empty");

/** Positive integer */
const PositiveInt = z.number().int().positive();

/** Non-negative integer  (0 is valid, e.g. absentees = 0) */
const NonNegativeInt = z.number().int().min(0);

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUB-SCHEMAS  (nested objects that compose the main schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timing block — all times are optional individually,
 * but cross-field ordering is validated via .superRefine() on the parent.
 */
export const ExamTimingSchema = z.object({
  reportingTime:   TimeString,
  gateClosingTime: TimeString,
  examTime:        TimeString,
  examEndTime:     TimeString.optional(),
  /** Computed / stored convenience field in minutes */
  durationMinutes: PositiveInt.optional(),
});
export type ExamTiming = z.infer<typeof ExamTimingSchema>;

/** Scoring configuration */
export const ScoringConfigSchema = z
  .object({
    totalQuestions:       PositiveInt.optional(),
    totalMarks:           PositiveInt.optional(),
    passingMarks:         PositiveInt.optional(),
    negativeMarking:      z.boolean().default(false),
    negativeMarkingRatio: NegativeMarkingRatioSchema.default("1/3"),
  })
  .refine(
    (v) =>
      v.passingMarks === undefined ||
      v.totalMarks === undefined ||
      v.passingMarks <= v.totalMarks,
    { message: "Passing marks cannot exceed total marks", path: ["passingMarks"] }
  );
export type ScoringConfig = z.infer<typeof ScoringConfigSchema>;

/** Candidate statistics (post-exam fill) */
export const CandidateStatsSchema = z.object({
  maxCapacity:        PositiveInt.optional(),
  reportedCandidates: NonNegativeInt.optional(),
  absenteesCount:     NonNegativeInt.optional(),
  centerCount:        PositiveInt.optional(),
});
export type CandidateStats = z.infer<typeof CandidateStatsSchema>;

/** Venue and physical location */
export const VenueInfoSchema = z.object({
  venueCity:       z.string().trim().optional(),
  venueState:      z.string().trim().optional(),
  reportingCenter: z.string().trim().optional(),
});
export type VenueInfo = z.infer<typeof VenueInfoSchema>;

/** Entry policy — items / documents */
export const EntryPolicySchema = z.object({
  admitCardRequired: z.boolean().default(true),
  idProofRequired:   z.boolean().default(true),
  idProofTypes:      z.array(NonEmptyString).default([]),
  itemsAllowed:      z.array(NonEmptyString).default([]),
  itemsProhibited:   z.array(NonEmptyString).default([]),
});
export type EntryPolicy = z.infer<typeof EntryPolicySchema>;

/** Accessibility provisions for PWD candidates */
export const AccessibilityConfigSchema = z
  .object({
    isPWDShift:          z.boolean().default(false),
    isScribeAllowed:     z.boolean().default(false),
    hasCompensatoryTime: z.boolean().default(false),
    compensatoryMinutes: PositiveInt.optional(),
  })
  .refine(
    (v) => !v.hasCompensatoryTime || (v.compensatoryMinutes !== undefined && v.compensatoryMinutes > 0),
    { message: "Compensatory minutes are required when compensatory time is enabled", path: ["compensatoryMinutes"] }
  );
export type AccessibilityConfig = z.infer<typeof AccessibilityConfigSchema>;

/** Re-examination flag + reason */
export const ReExamInfoSchema = z
  .object({
    isReExam:      z.boolean().default(false),
    reExamReason:  z.string().trim().optional(),
  })
  .refine(
    (v) => !v.isReExam || (v.reExamReason && v.reExamReason.length > 0),
    { message: "Reason is required for re-examination", path: ["reExamReason"] }
  );
export type ReExamInfo = z.infer<typeof ReExamInfoSchema>;

/** Audit / meta fields */
export const AuditMetaSchema = z.object({
  notificationRef: z.string().trim().optional(),
  createdBy:       z.string().trim().optional(),
  lastModified:    z.string().datetime({ offset: true }).optional(),
  createdAt:       z.string().datetime({ offset: true }).optional(),
});
export type AuditMeta = z.infer<typeof AuditMetaSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN EXAM SHIFT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const ExamShiftSchema = z
  .object({
    // ── Identity ──────────────────────────────────────────────────────────────
    /** DB primary key — optional on create, required on update */
    id:        z.string().uuid().optional(),
    /** Human-readable name, e.g. "Morning Shift 1" */
    shiftName: NonEmptyString.max(120, "Shift name too long"),
    /** Short alphanumeric code, e.g. "MS-01" */
    shiftCode: z.string().trim().max(20).optional(),
    /** Broad time-of-day slot */
    shiftSlot: ShiftSlotSchema.optional(),
    /** Which paper / stage this shift belongs to */
    paperType: PaperTypeSchema.optional(),

    // ── Date ─────────────────────────────────────────────────────────────────
    shiftDate: DateString,

    // ── Timings (inline for flat API payloads) ────────────────────────────────
    reportingTime:   TimeString,
    gateClosingTime: TimeString,
    examTime:        TimeString,
    examEndTime:     TimeString.optional(),
    durationMinutes: PositiveInt.optional(),

    // ── Exam configuration ────────────────────────────────────────────────────
    examMode:        ExamModeSchema,
    mediumOfExam:    MediumOfExamSchema,
    subjectsTested:  z.array(NonEmptyString).default([]),

    // ── Scoring ───────────────────────────────────────────────────────────────
    totalQuestions:       PositiveInt.optional(),
    totalMarks:           PositiveInt.optional(),
    passingMarks:         PositiveInt.optional(),
    negativeMarking:      z.boolean().default(false),
    negativeMarkingRatio: NegativeMarkingRatioSchema.default("1/3"),

    // ── Candidate stats ───────────────────────────────────────────────────────
    maxCapacity:        PositiveInt.optional(),
    reportedCandidates: NonNegativeInt.optional(),
    absenteesCount:     NonNegativeInt.optional(),
    centerCount:        PositiveInt.optional(),

    // ── Venue ─────────────────────────────────────────────────────────────────
    venueCity:       z.string().trim().optional(),
    venueState:      z.string().trim().optional(),
    reportingCenter: z.string().trim().optional(),

    // ── Entry policy ──────────────────────────────────────────────────────────
    admitCardRequired: z.boolean().default(true),
    idProofRequired:   z.boolean().default(true),
    idProofTypes:      z.array(NonEmptyString).default([]),
    itemsAllowed:      z.array(NonEmptyString).default([]),
    itemsProhibited:   z.array(NonEmptyString).default([]),

    // ── Status & flags ────────────────────────────────────────────────────────
    status:         ShiftStatusSchema.default("active"),
    isSpecialShift: z.boolean().default(false),

    // ── Accessibility ─────────────────────────────────────────────────────────
    isPWDShift:          z.boolean().default(false),
    isScribeAllowed:     z.boolean().default(false),
    hasCompensatoryTime: z.boolean().default(false),
    compensatoryMinutes: PositiveInt.optional(),

    // ── Re-exam ───────────────────────────────────────────────────────────────
    isReExam:     z.boolean().default(false),
    reExamReason: z.string().trim().optional(),

    // ── Content ───────────────────────────────────────────────────────────────
    instructions:    z.array(NonEmptyString).default([]),
    importantNotes:  z.string().trim().optional(),
    otherDetails:    z.string().trim().optional(),
    internalRemarks: z.string().trim().optional(),

    // ── Audit / meta ──────────────────────────────────────────────────────────
    notificationRef: z.string().trim().optional(),
    createdBy:       z.string().trim().optional(),
    lastModified:    z.string().datetime({ offset: true }).optional(),
    createdAt:       z.string().datetime({ offset: true }).optional(),
  })

  // ── Cross-field time ordering ──────────────────────────────────────────────
  .superRefine((v, ctx) => {
    const cmp = (a: string, b: string) => a.localeCompare(b);

    if (v.reportingTime && v.gateClosingTime && cmp(v.reportingTime, v.gateClosingTime) >= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Gate closing time must be after reporting time", path: ["gateClosingTime"] });
    }
    if (v.gateClosingTime && v.examTime && cmp(v.gateClosingTime, v.examTime) >= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam start time must be after gate closing time", path: ["examTime"] });
    }
    if (v.examEndTime && v.examTime && cmp(v.examEndTime, v.examTime) <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exam end time must be after exam start time", path: ["examEndTime"] });
    }

    // Scoring
    if (v.passingMarks !== undefined && v.totalMarks !== undefined && v.passingMarks > v.totalMarks) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passing marks cannot exceed total marks", path: ["passingMarks"] });
    }

    // Compensatory time
    if (v.hasCompensatoryTime && !v.compensatoryMinutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Compensatory minutes are required", path: ["compensatoryMinutes"] });
    }

    // Re-exam reason
    if (v.isReExam && !v.reExamReason?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Re-exam reason is required", path: ["reExamReason"] });
    }

    // Attendance sanity
    if (v.reportedCandidates !== undefined && v.maxCapacity !== undefined && v.reportedCandidates > v.maxCapacity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reported candidates cannot exceed max capacity", path: ["reportedCandidates"] });
    }
    if (v.absenteesCount !== undefined && v.maxCapacity !== undefined && v.absenteesCount > v.maxCapacity) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Absentees count cannot exceed max capacity", path: ["absenteesCount"] });
    }
  });

/** Full hydrated type (all fields present after parse) */
export type ExamShift = z.infer<typeof ExamShiftSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 5. PARTIAL SCHEMAS  (for PATCH / update operations)
// ─────────────────────────────────────────────────────────────────────────────

/** All fields optional — for HTTP PATCH / partial update */
// export const ExamShiftUpdateSchema = ExamShiftSchema?.partial().extend({
//   id: z.string().uuid("Valid UUID required for update"),
// });
// export type ExamShiftUpdate = z.infer<typeof ExamShiftUpdateSchema>;

/** Create payload — id is always stripped (DB generates it) */
// export const ExamShiftCreateSchema = ExamShiftSchema.omit({ id: true });
// export type ExamShiftCreate = z.infer<typeof ExamShiftCreateSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 6. LIST / ARRAY SCHEMA  (for bulk operations or parent-form field arrays)
// ─────────────────────────────────────────────────────────────────────────────

export const ExamShiftsArraySchema = z
  .array(ExamShiftSchema)
  .min(1, "At least one shift is required")
  .superRefine((shifts, ctx) => {
    const seen = new Map<string, number>();
    shifts.forEach((shift, idx) => {
      const key = `${shift.shiftDate}::${shift.shiftName.trim().toLowerCase()}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate shift name "${shift.shiftName}" on ${shift.shiftDate} (first seen at index ${seen.get(key)})`,
          path: [idx, "shiftName"],
        });
      } else {
        seen.set(key, idx);
      }
    });
  });
export type ExamShiftsArray = z.infer<typeof ExamShiftsArraySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 7. QUERY / FILTER SCHEMA  (for API list endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export const ExamShiftQuerySchema = z.object({
  /** Filter by status */
  status:    ShiftStatusSchema.optional(),
  /** Filter by exam mode */
  examMode:  ExamModeSchema.optional(),
  /** Filter by paper type */
  paperType: PaperTypeSchema.optional(),
  /** Filter by exact date */
  shiftDate: DateString.optional(),
  /** Filter by date range */
  dateFrom:  DateString.optional(),
  dateTo:    DateString.optional(),
  /** Free-text search across shiftName / shiftCode / venueCity */
  search:    z.string().trim().optional(),
  /** Parent exam ID to scope the query */
  examId:    z.string().uuid().optional(),
  /** Pagination */
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  /** Sort */
  sortBy:    z.enum(["shiftDate", "shiftName", "examTime", "status", "createdAt"]).default("shiftDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export type ExamShiftQuery = z.infer<typeof ExamShiftQuerySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 8. API RESPONSE WRAPPER SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ExamShiftResponseSchema = z.object({
  success: z.literal(true),
  data:    ExamShiftSchema,
});
export type ExamShiftResponse = z.infer<typeof ExamShiftResponseSchema>;

export const ExamShiftsListResponseSchema = z.object({
  success: z.literal(true),
  data:    z.array(ExamShiftSchema),
  meta: z.object({
    total:      z.number().int(),
    page:       z.number().int(),
    limit:      z.number().int(),
    totalPages: z.number().int(),
  }),
});
export type ExamShiftsListResponse = z.infer<typeof ExamShiftsListResponseSchema>;
