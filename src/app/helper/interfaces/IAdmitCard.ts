
import { ICategory } from "./ICategory";
import { IDynamicField } from "./IDynamicField";
import { IImportantDate } from "./IImportantDate";
import { IImportantLink } from "./IImportantLink";
import { IJob } from "./IJob";
import { IJobSnapshot } from "./IJobSnapshot";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { IOrganization } from "./IOrganization";
import { ISeoSettings } from "./ISeoSettings";
import { IState } from "./IState";
import { ITag } from "./ITag";

export enum AdmitCardStatus {
  ACTIVE = 'active',
  POSTPONED = 'postponed',
  LINK_INACTIVE = 'link_inactive',
  RELEASED = 'released',
  UPCOMING = 'upcoming',
  CLOSED = 'closed',
  DELETED = 'deleted',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export interface IExamShift {
  shiftName: string;
  shiftDate: string; // ISO date
  reportingTime: string;
  gateClosingTime: string;
  examTime: string;
  examEndTime?: string;
  instructions?: string[];
  status?: "active" | "postponed" | "completed" | "cancelled";
  language?: string;
  examType?: string;
  maxCapacity?: number;
  isSpecialShift?: boolean;
  otherDetails?: string;
}

export interface IAdmitCard {
  id: string;

  title: string;
  slug: string;
  examName: string;

  descriptionJson?: string | null;
  descriptionHtml?: string | null;

  organization: IOrganization;
  category?: ICategory | null;

  status: AdmitCardStatus;

  // Key Dates
  releaseDate?: Date | null;
  examStartDate?: Date | null;
  examEndDate?: Date | null;

  modeOfExam?: string | null;
  examShifts?: IExamShift[] | null;
  examLocation?: string | null;

  // importantInstructions?: string[] | null;

  cardTags: string[] | null;
  tags: ITag[];

  helpfullVideoLinks?: string[] | null;

  importantDates?: IImportantDate[];
  importantLinks?: IImportantLink[] | null;

  job?: IJob | null;

  states: IState[];

  locationText?: string | null;

  newsAndNotifications: INewsAndNtfn[];

  jobSnapshot?: IJobSnapshot | null;

  publishedAt?: Date | null;

  reviewStatus: string;

  dynamicFields?: IDynamicField[] | null;

  seoSettings?: ISeoSettings | null;

  isFeatured?: boolean;

  createdAt: Date;
  updatedAt: Date;

  lastUpdatedBy?: string | null;

  deletedAt?: Date | null;
}