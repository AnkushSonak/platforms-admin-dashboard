import { NewsAndNtfnPriorityType } from "@/app/helper/constants/NewsAndNtfnPriorityType";
import { NewsAndNtfnRelatedEntityType } from "@/app/helper/constants/NewsAndNtfnRelatedEntityType";
import { ReviewStatus } from "./global";
import { NewsAndNntfnStatusType } from "@/app/helper/constants/NewsAndNntfnStatusType";


export interface NewsAndNtfnFormDTO {
  id: string;

  title: string;
  shortTitle: string;

  descriptionHtml: string;
  descriptionJson: string;

  // headlineImage: {
  //   url: string;
  //   altText: string;
  //   caption?: string;
  // };

  officialOrderNumber?: string;

  version: number;

  status: NewsAndNntfnStatusType;
  priority: NewsAndNtfnPriorityType;
  relatedEntityType?: NewsAndNtfnRelatedEntityType;

  // --- Localization ---
  language?: string | null;
  translations?: {
    [locale: string]: {
      title: string;
      summary: string;
    };
  } | null;

  officialLink?: string;
  downloadLink?: string;

  isFeatured: boolean;

  importantLinks: {
    label: string;
    links: string[];
  }[] | null;

  // --- Relations ---
  organizationId: string;
  categoryId?: string;
  stateIds: string[];

  relatedJobIds: string[];
  relatedAdmitCardIds: string[];
  relatedResultIds: string[];
  relatedAnswerKeyIds: string[];

  // ---- Tags ----
  cardTags: string[] | null;
  tagIds: string[] | null;

  // --- Dynamic Content ---
  dynamicFields?: any;

  // --- AI Enhancements ---
  // aiMeta?: {
  //   tldr: string;
  //   keyTakeaways: string[];
  //   sentiment: "positive" | "neutral" | "urgent";
  //   predictedPopularity: number; // 1–100
  //   semanticVector: number[];
  //   readingTimeMinutes: number;
  // };

  // --- SEO ---
  // seo?: {
  //   metaTitle: string;
  //   metaDescription: string;
  //   schemaType: "NewsArticle" | "GovernmentService";
  //   canonicalUrl: string;
  //   keywords: string[];
  // };

  metaTitle?: string;
  metaDescription?: string;
  seoKeywords?: string[];
  seoCanonicalUrl?: string;
  schemaMarkupJson?: any;

  // --- Eligibility / Filters ---
  minAge?: number;
  maxAge?: number;
  qualificationSummary?: string;
  qualificationIds?: string[];

  // --- Engagement ---
  engagement?: {
    view_count: number;
    save_count: number;
    share_count: number;
    heat_index: number;
    live_viewers: number;
  };

  // --- Review & Audit ---
  reviewStatus: ReviewStatus;
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
