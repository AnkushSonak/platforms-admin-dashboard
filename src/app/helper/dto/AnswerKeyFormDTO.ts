import { ReviewStatus } from "./global";

export interface AnswerKeyFormDTO {
    id: string;

    // Basic Title Info
    answerKeyTitle: string;
    answerKeyDescriptionJson?: string;
    answerKeyDescriptionHtml?: string;
    answerKeySlug: string;
    answerKeyAdvtNumber?: string;
    answerKeyExamName: string;
    answerKeyOrganization: string;

    categoryId: string | null;

    answerKeyStatus: string;

    // Dates
    answerKeyReleaseDate?: Date | null;

    answerKeyDownloadLink: string | null;
    answerKeyOfficialWebsite: string | null;

    jobId?: string | null;              // ✅ instead of Job object
    stateIds: string[];                 // ✅ instead of State[]
    newsAndNotifications: string[];     // ✅ instead of objects
    relatedJobs: string[];              // ✅ job ids

    /* Picked from Job entity */
    sector?: string;

    locationText?: string;
    qualification?: string;
    logo?: string;
    logoImageUrl?: string | null;
    logoBgColor?: string;
    totalVacancies?: string;

    tags?: string[];
    helpfullVideoLinks?: string[];

    importantDates?: any;
    importantLinks?: {
        label: string;
        links: string[];
    }[] | null;

    vacancyDetails?: any;
    eligibility?: any;

    jobType?: string;
    ageLimitText?: string;
    applicationFee?: any;

    selectionProcess?: string[];
    salary?: string[];
    howToApply?: string[];

    contactDetails?: any;
    examPattern?: any;
    syllabus?: string[];

    isAnswerKeyNew: boolean;

    metaTitle?: string;
    metaDescription?: string;
    applyLink?: string;

    seoKeywords?: string[];
    seoCanonicalUrl?: string;

    schemaMarkupJson?: any;

    viewCount: number;
    clickCount: number;
    saveCount: number;

    publishDate?: Date | null;
    expiryDate?: Date | null;
    autoPublishAt?: Date | null;

    isExpired: boolean;

    lastUpdatedBy?: string | null;
    notes?: string;

    reviewStatus: ReviewStatus;

    estimatedSalaryRange?: {
        min: string | number;
        max: string | number;
    };

    applicationMode?: string;
    jobLevel?: string;

    dynamicFields?: any;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // dynamicFields?: Array<{
    //   label: string;
    //   type: "text" | "table" | "json";
    //   value?: string | Record<string, any> | Array<Record<string, any>>;
    //   columns?: string[];
    //   rows?: string[][];
    // }>;
}

export enum AnswerKeyStatus {
    RELEASED = 'released',
    UPCOMING = 'upcoming',
    CLOSED = 'closed',
}
