// src/interfaces/IAnswerKey.ts

import { IState } from "./IState";
import { IJob } from "./IJob";
import { ICategory } from "./ICategory";
import { IOrganization } from "./IOrganization";
import { ITag } from "./ITag";
import { IJobSnapshot } from "./IJobSnapshot";
import { INewsAndNtfn } from "./INewsAndNtfn";
import { IImportantLink } from "./IImportantLink";
import { IDynamicField } from "./IDynamicField";
import { ISeoSettings } from "./ISeoSettings";

export enum AnswerKeyStatus {
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

export enum AnswerKeyType {
  PROVISIONAL = "provisional",
  FINAL = "final",
  REVISED = "revised"
}

export interface IAnswerKey {
  id: string;

  title: string;
  slug: string;
  examName: string;

  descriptionJson?: string | null;
  descriptionHtml?: string | null;

  organization: IOrganization;
  category?: ICategory | null;

  status: AnswerKeyStatus;

  downloadLink: string;
  officialWebsite: string;

  releaseDate?: Date | null;

  // Key specific
  keyType: AnswerKeyType;

  objectionLink?: string | null;
  objectionStartDate?: Date | null;
  objectionEndDate?: Date | null;

  modeOfExam?: string | null;

  job?: IJob | null;

  jobSnapshot?: IJobSnapshot | null;

  states: IState[];

  newsAndNotifications: INewsAndNtfn[];

  locationText?: string | null;

  cardTags: string[] | null;
  tags: ITag[];

  helpfullVideoLinks?: string[] | null;

  importantDates?: any;

  importantLinks?: IImportantLink[] | null;

  reviewStatus: string;

  dynamicFields?: IDynamicField[] | null;

  seoSettings?: ISeoSettings | null;

  isFeatured?: boolean;

  publishDate?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  lastUpdatedBy?: string | null;

  deletedAt?: Date | null;
}