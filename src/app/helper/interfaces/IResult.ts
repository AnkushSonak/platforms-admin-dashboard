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

export type ResultStatus =
  | "active"
  | "postponed"
  | "link_inactive"
  | "upcoming";

export type ResultType =
  | "pdf_list"
  | "login_portal"
  | "scorecard"
  | "other";

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