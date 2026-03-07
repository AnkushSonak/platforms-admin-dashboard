import { z } from "zod";
import { ExamShiftSchema } from "./ExamShiftSchema";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

const dateSchema = z.coerce.date();
const requiredTrimmedString = (message: string) =>
  z.preprocess(
    (v) => (v === undefined || v === null ? "" : v),
    z.string().trim().min(1, message)
  );

/* ---------------------------------- */
/* Nested Schemas */
/* ---------------------------------- */

const compareTime = (left: string, right: string) => left.localeCompare(right);

// const ExamShiftSchema = z
//   .object({
//     shiftName: requiredTrimmedString("Shift name is required"),
//     shiftDate: requiredTrimmedString("Shift date is required"),
//     reportingTime: requiredTrimmedString("Reporting time is required"),
//     gateClosingTime: requiredTrimmedString("Gate closing time is required"),
//     examTime: requiredTrimmedString("Exam start time is required"),
//     examEndTime: z.string().trim().optional(),
//     instructions: z.array(z.string().min(1)).optional(),
//     status: z.enum(["active", "postponed", "completed", "cancelled"]).optional(),
//     language: z.string().trim().optional(),
//     examType: z.string().trim().optional(),
//     maxCapacity: z.coerce.number().int().min(0).optional(),
//     isSpecialShift: z.boolean().optional(),
//     otherDetails: z.string().optional(),
//   })
//   .superRefine((shift, ctx) => {
//     if (compareTime(shift.reportingTime, shift.gateClosingTime) > 0) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["gateClosingTime"],
//         message: "Gate closing time must be after or equal to reporting time",
//       });
//     }
//     if (compareTime(shift.gateClosingTime, shift.examTime) > 0) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["examTime"],
//         message: "Exam start time must be after or equal to gate closing time",
//       });
//     }
//     if (shift.examEndTime && compareTime(shift.examTime, shift.examEndTime) >= 0) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         path: ["examEndTime"],
//         message: "Exam end time must be after exam start time",
//       });
//     }
//   });

const ImportantLinkSchema = z.object({
  label: z.string().min(1),
  links: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
    type: z.enum(["website", "pdf", "video", "other"]),
    description: z.string().optional(),
  })),
});

const DynamicFieldMetaSchema = z.record(z.string(), z.unknown()).optional();

const DynamicFieldSchema = z.discriminatedUnion("type", [
  z.object({
    label: z.string().trim().min(1),
    type: z.literal("text"),
    value: z.string().optional(),
    meta: DynamicFieldMetaSchema,
  }),
  z.object({
    label: z.string().trim().min(1),
    type: z.literal("json"),
    value: z.union([z.record(z.string(), z.unknown()), z.array(z.unknown())]).optional(),
    meta: DynamicFieldMetaSchema,
  }),
  z.object({
    label: z.string().trim().min(1),
    type: z.literal("table"),
    value: z
      .union([
        z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
        z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))),
      ])
      .optional(),
    columns: z.array(z.string()).optional(),
    rows: z.array(z.array(z.string())).optional(),
    meta: DynamicFieldMetaSchema,
  }),
  z.object({
    label: z.string().trim().min(1),
    type: z.literal("richtext"),
    value: z
      .object({
        json: z.unknown().optional(),
        html: z.string().optional(),
      })
      .optional(),
    meta: DynamicFieldMetaSchema,
  }),
]);

const ImportantDateSchema = z.object({
  label: z.string().trim().min(1),
  date: z.string().trim().min(1),
  type: z.enum(["application", "exam", "result", "other"]),
  description: z.string().optional(),
  tag: z.string().optional(),
  isMilestone: z.boolean().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

const ImportantDatesArraySchema = z.preprocess((value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value;

  // Backward compatibility: tolerate legacy object payloads.
  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    // Single date object mistakenly stored as object.
    if ("label" in objectValue && "date" in objectValue) {
      return [objectValue];
    }

    // Keyed map/object container -> array of entries.
    return Object.values(objectValue).filter((entry) => entry && typeof entry === "object");
  }

  return value;
}, z.array(ImportantDateSchema));

const JobSnapshotSchema = z.object({
  advtNumber: z.string().optional(),
  sector: z.string().optional(),
  qualifications: z.array(z.unknown()).optional(),
  qualificationSummary: z.string().optional(),
  totalVacancies: z.coerce.number().int().min(0).optional(),
  jobType: z.string().optional(),
  ageLimitText: z.string().optional(),
  applicationFee: z.unknown().optional(),
  minAge: z.coerce.number().int().min(0).optional(),
  maxAge: z.coerce.number().int().min(0).optional(),
  dynamicFields: z.array(DynamicFieldSchema).optional(),
  importantLinks: z.array(ImportantLinkSchema).optional(),
  importantDates: ImportantDatesArraySchema.optional(),
  helpfullVideoLinks: z.array(z.string().url()).optional(),
});

const SeoSchema = z.object({
  metaTitle: z
    .string()
    .trim()
    .min(10, "Meta title must be at least 10 characters")
    .optional()
    .or(z.literal("")),

  metaDescription: z
    .string()
    .trim()
    .min(30, "Meta description must be at least 30 characters")
    .optional()
    .or(z.literal("")),

  seoKeywords: z.array(z.string().min(1)).optional(),

  seoCanonicalUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),

  schemaMarkupJson: z.any().optional(),
});

/* ---------------------------------- */
/* Main Schema */
/* ---------------------------------- */

export const AdmitCardSchema = z.object({
  /* ================= Core ================= */

  id: z.string().optional(),

  title: z.string().min(1).max(355),
//   slug: z.string().min(1),
  examName: z.string().min(1),

  descriptionJson: z.string().nullable().optional(),
  descriptionHtml: z.string().nullable().optional(),

  organizationId: z.string().min(1),
  categoryId: z.string().nullable().optional(),

  status: z.enum(["upcoming", "released", "postponed", "closed", "expired", "link_inactive", "cancelled"]),
  lifecycleStatus: z.enum(["draft", "pending_review", "published", "archived"]),

  /* ================= Dates ================= */

  releaseDate: dateSchema.nullable().optional(),
  examStartDate: dateSchema.nullable().optional(),
  examEndDate: dateSchema.nullable().optional(),
  publishedAt: dateSchema.nullable().optional(),

  /* ================= Exam Details ================= */

  modeOfExam: z.string().nullable().optional(),

  examShifts: z
    .array(ExamShiftSchema)
    .nullable()
    .optional()
    .superRefine((shifts, ctx) => {
      if (!shifts) return;
      const seen = new Map<string, number>();
      shifts.forEach((shift, idx) => {
        const key = `${shift.shiftDate.trim().toLowerCase()}::${shift.shiftName.trim().toLowerCase()}`;
        const existing = seen.get(key);
        if (existing !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [idx, "shiftName"],
            message: "Shift name + date must be unique per admit card",
          });
        } else {
          seen.set(key, idx);
        }
      });
    }),

  examLocation: z.string().nullable().optional(),

  // importantInstructions: z
  //   .array(z.string().min(1))
  //   .nullable()
  //   .optional(),

  /* ================= Relations ================= */

  jobId: z.string().nullable().optional(),

  relatedJobIds: z.array(z.string()).optional(),
  stateIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  newsAndNotificationIds: z.array(z.string()).default([]),

  jobSnapshot: JobSnapshotSchema.nullable().optional(),

  /* ================= Content Blocks ================= */

  cardTags: z.array(z.string()).nullable().optional(),

  helpfullVideoLinks: z
    .array(z.string().url())
    .nullable()
    .optional(),

  importantDates: ImportantDatesArraySchema.nullable().optional(),

  importantLinks: z.array(ImportantLinkSchema).nullable().optional(),

  /* ================= Dynamic ================= */

  dynamicFields: z.array(DynamicFieldSchema).nullable().optional(),

  /* ================= SEO ================= */

  seoSettings: SeoSchema.nullable().optional(),

  /* ================= Flags ================= */

  isFeatured: z.boolean().default(false).optional(),

  /* ================= Admin ================= */
  lastUpdatedBy: z.string().nullable().optional(),
});

export type AdmitCardFormValues = z.input<typeof AdmitCardSchema>;
