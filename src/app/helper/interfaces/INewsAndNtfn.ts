
import { IState } from "./IState";
import { NewsAndNtfnPriorityType } from "../constants/NewsAndNtfnPriorityType";
import { NewsAndNtfnRelatedEntityType } from "../constants/NewsAndNtfnRelatedEntityType";
import { NewsAndNntfnStatusType } from "../constants/NewsAndNntfnStatusType";
import { IQualification } from "./IQualification";
import { IOrganization } from "./IOrganization";
import { ICategory } from "./ICategory";
import { IJob } from "./IJob";
import { IAdmitCard } from "./IAdmitCard";
import { IAnswerKey } from "./IAnswerKey";
import { ITag } from "./ITag";
import { IResult } from "./IResult";

export interface INewsAndNtfn {
  id: string;

  title: string;
  shortTitle: string;
  slug: string;

  descriptionHtml: string;
  descriptionJson: string;

  headlineImage: {
    url: string;
    altText: string;
    caption?: string;
  };

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
  organization: IOrganization;
  category?: ICategory | null;
  states: IState[];

  job?: IJob | null;
  admitCard?: IAdmitCard | null;
  result?: IResult | null;
  answerKey?: IAnswerKey | null;

  // tags
  cardTags: string[] | null;
  tags: ITag[] | null;

  // --- Dynamic Content ---
  dynamicFields?: Array<{
    label: string;
    type: "text" | "table" | "json";
    value?: string | Record<string, any> | Array<Record<string, any>>;
    columns?: string[];
    rows?: string[][];
  }>;

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
  qualifications?: IQualification[];

  // --- Engagement ---
  engagement?: {
    view_count: number;
    save_count: number;
    share_count: number;
    heat_index: number;
    live_viewers: number;
  };

  // --- Review & Audit ---
  reviewStatus: "draft" | "published" | "archived";
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
