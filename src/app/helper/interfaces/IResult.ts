// src/interfaces/IResult.ts

import { IJob } from "./IJob";
import { IState } from "./IState";
import { ICategory } from "./ICategory";
import { IOrganization } from "./IOrganization";
import { ITag } from "./ITag";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { IImportantLink } from "./IImportantLink";
import { IJobSnapshot } from "./IJobSnapshot";
import { IDynamicField } from "./IDynamicField";
import { ISeoSettings } from "./ISeoSettings";

export enum ResultStatus {
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

export enum ResultType {
  PDF_LINK = "pdf_list",
  LOGIN_PORTAL = "login_portal",
  SCORECARD = "scorecard",
  OTHER = "other",
}

export interface ICutOffMark {
  category: string; // UR, OBC, SC, ST, EWS
  marks: string | number;
  remarks?: string;
}

export interface IResult {
  id: string;

  title: string;
  slug: string;
  examName: string;

  descriptionJson?: string | null;
  descriptionHtml?: string | null;

  examPhase?: string | null;

  resultType: ResultType;

  cutOffMarks?: ICutOffMark[] | null;

  resultLink?: string | null;
  marksheetLink?: string | null;

  status: ResultStatus;

  releaseDate: Date;

  downloadLink?: string | null;
  officialWebsite?: string | null;

  job?: IJob | null;

  organization: IOrganization;

  category?: ICategory | null;

  states: IState[];

  newsAndNotifications: INewsAndNtfn[];

  locationText?: string | null;

  cardTags: string[] | null;
  tags: ITag[];

  helpfullVideoLinks?: string[] | null;

  importantDates?: any;

  importantLinks?: IImportantLink[] | null;

  jobSnapshot?: IJobSnapshot | null;

  publishDate?: Date | null;

  reviewStatus: string;

  dynamicFields?: IDynamicField[] | null;

  seoSettings?: ISeoSettings | null;

  createdAt: Date;
  updatedAt: Date;

  lastUpdatedBy?: string | null;

  deletedAt?: Date | null;
}