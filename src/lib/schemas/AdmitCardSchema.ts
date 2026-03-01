import { z } from "zod";
import { AdmitCardStatus } from "@/app/helper/interfaces/IAdmitCard";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

const dateSchema = z.coerce.date();

/* ---------------------------------- */
/* Nested Schemas */
/* ---------------------------------- */

const ExamShiftSchema = z.object({
  shiftName: z.string().min(1),
  reportingTime: z.string().min(1),
  gateClosingTime: z.string().min(1),
  examTime: z.string().min(1),
  otherDetails: z.string().optional(),
});

const ImportantLinkSchema = z.object({
  label: z.string().min(1),
  links: z.array(z.object({
    title: z.string().min(1),
    url: z.string().url(),
    type: z.string().min(1),
    description: z.string().optional(),
  })),
});

const DynamicFieldSchema = z.object({
  label: z.string().min(1),
  value: z.any(),
  type: z.enum(["text", "json", "table", "richtext"]),
  meta: z.any().optional(),
});

// const jobSnapshotSchema = z.object({
//   advtNumber: z.string().optional(),
//   jobType: z.string().optional(),
//   jobLevel: z.string().optional(),
//   ageLimitText: z.string().optional(),
//   applyLink: z.string().url().optional(),
//   estimatedSalaryRange: z.object({
//     min: z.union([z.string(), z.number()]).optional(),
//     max: z.union([z.string(), z.number()]).optional(),
//   }).optional(),
//   applicationMode: z.string().optional(),
//   dynamicFields: z.array(DynamicFieldSchema).optional(),
// });

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

  status: z.enum(Object.values(AdmitCardStatus) as [string, ...string[]]),

  /* ================= Dates ================= */

  releaseDate: dateSchema.nullable().optional(),
  examStartDate: dateSchema.nullable().optional(),
  examEndDate: dateSchema.nullable().optional(),
  publishDate: dateSchema.nullable().optional(),

  /* ================= Exam Details ================= */

  modeOfExam: z.string().nullable().optional(),

  examShifts: z.array(ExamShiftSchema).nullable().optional(),

  examLocation: z.string().nullable().optional(),

  // importantInstructions: z
  //   .array(z.string().min(1))
  //   .nullable()
  //   .optional(),

  /* ================= Relations ================= */

  jobId: z.string().nullable().optional(),

  stateIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  newsAndNotificationIds: z.array(z.string()).default([]),

  jobSnapshot: z.any().nullable().optional(),

  /* ================= Content Blocks ================= */

  cardTags: z.array(z.string()).nullable().optional(),

  helpfullVideoLinks: z
    .array(z.string().url())
    .nullable()
    .optional(),

  importantDates: z.any().nullable().optional(),

  importantLinks: z.array(ImportantLinkSchema).nullable().optional(),

  /* ================= Dynamic ================= */

  dynamicFields: z.array(DynamicFieldSchema).nullable().optional(),

  /* ================= SEO ================= */

  seo: SeoSchema.nullable().optional(),

  /* ================= Flags ================= */

  isFeatured: z.boolean().default(false).optional(),

  /* ================= Admin ================= */

  reviewStatus: z.enum(["draft", "published", "archived"]),

  lastUpdatedBy: z.string().nullable().optional(),
});

export type AdmitCardFormValues = z.input<typeof AdmitCardSchema>;