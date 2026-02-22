import { NewsAndNntfnStatusType } from "@/app/helper/constants/NewsAndNntfnStatusType";
import { NewsAndNtfnPriorityType } from "@/app/helper/constants/NewsAndNtfnPriorityType";
import { NewsAndNtfnRelatedEntityType } from "@/app/helper/constants/NewsAndNtfnRelatedEntityType";
import { z } from "zod";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

const dateSchema = z.coerce.date();

/* ---------------------------------- */
/* Nested Schemas */
/* ---------------------------------- */

// export const HeadlineImageSchema = z.object({
//   url: z.string().url(),
//   altText: z.string().min(1),
//   caption: z.string().optional(),
// });

export const TranslationSchema = z.record(
  z.string(),
  z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
  })
);

// export const SourceLinkSchema = z.object({
//   label: z.string().min(1),
//   url: z.string().url(),
//   isVerified: z.boolean(),
// });

// export const DynamicFieldSchema = z.object({
//   label: z.string().min(1),
//   type: z.enum(["text", "table", "json"]),
//   value: z
//     .union([
//       z.string(),
//       z.record(z.any()),
//       z.array(z.record(z.any())),
//     ])
//     .optional(),
//   columns: z.array(z.string()).optional(),
//   rows: z.array(z.array(z.string())).optional(),
// });

// export const AiMetaSchema = z.object({
//   tldr: z.string().min(1),
//   keyTakeaways: z.array(z.string().min(1)),
//   sentiment: z.enum(["positive", "neutral", "urgent"]),
//   predictedPopularity: z.number().int().min(1).max(100),
//   semanticVector: z.array(z.number()),
//   readingTimeMinutes: z.number().int().positive(),
// });

// export const SeoSchema = z.object({
//   metaTitle: z.string().min(1),
//   metaDescription: z.string().min(1),
//   schemaType: z.enum(["NewsArticle", "GovernmentService"]),
//   canonicalUrl: z.string().url(),
//   keywords: z.array(z.string().min(1)),
// });

export const EngagementSchema = z.object({
  view_count: z.number().int().nonnegative(),
  save_count: z.number().int().nonnegative(),
  share_count: z.number().int().nonnegative(),
  heat_index: z.number().nonnegative(),
  live_viewers: z.number().int().nonnegative(),
});

/* ---------------------------------- */
/* Relation Stubs (Lightweight) */
/* ---------------------------------- */

const EntityRefSchema = z.object({
  id: z.string(), // Allow any string, not just uuid, for flexibility
});

// Accept either a string or an object with an id
const EntityRefOrStringSchema = z.union([z.string(), EntityRefSchema]);

/* ---------------------------------- */
/* Main Schema */
/* ---------------------------------- */

export const NewsAndNotificationSchema = z.object({
  id: z.string().uuid().optional(),

  title: z.string().min(1).max(355),
  shortTitle: z.string().min(1),
  // slug: z.string().min(1).optional(),

  descriptionHtml: z.string().min(1),
  descriptionJson: z.string().min(1),

  // headlineImage: HeadlineImageSchema,

  officialOrderNumber: z.string().optional(),

  version: z.float64().positive(),

  status: z.enum(Object.values(NewsAndNntfnStatusType) as [string, ...string[]]),
  priority: z.enum(Object.values(NewsAndNtfnPriorityType) as [string, ...string[]]),
  relatedEntityType: z
    .enum(
      Object.values(
        NewsAndNtfnRelatedEntityType
      ) as [string, ...string[]]
    )
    .optional(),

  language: z.string().min(2).max(10).optional(),

  translations: TranslationSchema.optional(),

  officialLink: z.string().url().optional(),
  downloadLink: z.string().url().optional(),

  isFeatured: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  cardTags: z.array(z.string()).default([]).optional(),
  tagIds: z.array(z.string()).default([]).optional(),
  importantLinks: z.any().optional(),

  // sourceLinks: z.array(SourceLinkSchema).optional(),

  organizationId: z.string(),
  categoryId: z.string().optional().nullable(),
  stateIds: z.array(z.string()).default([]),

  relatedJobIds: z.array(z.string()).default([]),
  relatedAdmitCardIds: z.array(z.string()).default([]),
  relatedResultIds: z.array(z.string()).default([]),
  relatedAnswerKeyIds: z.array(z.string()).default([]),

  dynamicFields: z.any().optional(),

  // aiMeta: AiMetaSchema.optional(),

  // seo: SeoSchema.optional(),

  metaTitle: z.string().min(1).optional(),
  metaDescription: z.string().min(1).optional(),
  seoKeywords: z.array(z.string().min(1)).optional(),
  seoCanonicalUrl: z.string().url().optional(),
  schemaMarkupJson: z.any().optional(),

  minAge: z.number().int().nonnegative().optional(),
  maxAge: z.number().int().nonnegative().optional(),
  qualificationSummary: z.string().nullable().optional(),
  qualificationIds: z.array(z.string()).default([]), //z.array(z.string().min(1)).optional(),

  engagement: EngagementSchema.optional(),

  reviewStatus: z.enum(["draft", "published", "archived"]),

  publishedAt: dateSchema.optional(),
});
