import { z } from "zod";

/**
 * ------------------------------------------------
 * Reusable Schemas
 * ------------------------------------------------
 */

const uuidSchema = z.string().uuid();

const jsonSchema = z.record(z.string(), z.any()).nullable().optional();

/** Important Links Schema */
const importantLinksSchema = z
  .array(
    z.object({
      label: z.string().min(1),
      links: z.array(z.string().url()),
    })
  )
  .nullable()
  .optional();

/** Dynamic Fields Schema (Aligned with Entity) */
const dynamicFieldSchema = z.object({
  label: z.string().min(1),
  type: z.enum(["text", "table", "json"]),
  value: z.union([
    z.string(),
    z.record(z.string(), z.any()),
    z.array(z.record(z.string(), z.any())),
  ]).optional(),
  columns: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
});

/** SEO Settings Schema */
const seoSettingsSchema = z
  .object({
    metaTitle: z.string().max(255).optional(),
    metaDescription: z.string().max(500).optional(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().url().optional(),
    schemaMarkup: z.any().optional(),
  })
  .nullable()
  .optional();

/** ------------------------------------------------
 * Main Job Schema
 * ------------------------------------------------
 */

export const jobSchema = z
  .object({
    /** 🔑 CORE  */
    id: uuidSchema.optional(),

    title: z.string().min(3, "Job title is required").max(255),

    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, "Slug must be URL-safe").optional(),

    advtNumber: z.string().max(255).nullable().optional(),

    status: z.enum([ "active", "expired", "upcoming", "draft", "archived", "postponed"]).default("active"),

    isFeatured: z.boolean().default(false),

    /** 🏢 ORGANIZATION & CLASSIFICATION  */
    organizationId: uuidSchema, // Required (ManyToOne)

    categoryId: uuidSchema.nullable().optional(),

    sector: z.string().max(100).nullable().optional(),

    jobType: z.string().max(100).nullable().optional(),

    jobLevel: z.string().max(100).nullable().optional(),

    applicationMode: z.string().max(50).nullable().optional(),

    /** 📝 CONTENT */
    descriptionJson: z.string().nullable().optional(),

    descriptionHtml: z.string().nullable().optional(),

    qualificationSummary: z.string().nullable().optional(),

    /** 📄 LINKS  */
    officialWebsite: z.string().url().nullable().optional(),

    applyLink: z.string().url().nullable().optional(),

    /** 📍 LOCATION  */
    locationText: z.string().max(255).nullable().optional(),

    states: z.array(uuidSchema).optional(), // ManyToMany

    /** 👥 ELIGIBILITY  */
    minAge: z.number().int().min(0).nullable().optional(),

    maxAge: z.number().int().min(0).nullable().optional(),

    ageLimitText: z.string().max(50).nullable().optional(),

    /** 💰 SALARY  */
    minSalary: z.coerce.number().int().positive().nullable().optional(),

    salaryText: z.string().nullable().optional(),

    /** 🧾 VACANCIES & FEES  */
    totalVacancies: z.coerce.number().int().min(0).default(0),

    applicationFee: jsonSchema,

    /** 🗓️ DATES */
    applyStartDate: z.coerce.date().nullable().optional(),

    expiryDate: z.coerce.date().nullable().optional(),

    mainExamDate: z.coerce.date().nullable().optional(),

    /** 🎥 MEDIA */
    helpfulVideoLinks: z.array(z.string().url()).nullable().optional(),

    importantDates: jsonSchema,

    importantLinks: importantLinksSchema,

    /** 🏷️ TAGGING */
    tags: z.array(uuidSchema).optional(),

    relatedJobs: z.array(uuidSchema).optional(),

    /** 📰 RELATED CONTENT (IDs only)  */
    newsAndNotificationIds: z.array(uuidSchema).optional(),
    admitCardIds: z.array(uuidSchema).optional(),
    resultIds: z.array(uuidSchema).optional(),
    answerKeyIds: z.array(uuidSchema).optional(),

    /** 🧩 DYNAMIC FIELDS */
    dynamicFields: z.array(dynamicFieldSchema).nullable().optional(),

    /** 🔍 SEO  */
    seoSettings: seoSettingsSchema,

    /** ⏱️ AUDIT */
    lastUpdatedBy: uuidSchema.nullable().optional(),

    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

/** Type Export */
export type JobFormData = z.infer<typeof jobSchema>;
