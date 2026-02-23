export interface ICategory {
  id: string;
  name: string;
  slug: string;

  // Hierarchy
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }[];

  // UI
  iconUrl?: string;
  brandColor: string;
  priorityOrder: number;
  isFeatured: boolean;

  // SEO
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
    h1Text?: string;
    footerContent?: string;
  };

  // Relations count (recommended instead of full arrays)
  stats?: {
    jobsCount: number;
    admitCardsCount: number;
    resultsCount: number;
    answerKeysCount: number;
    newsCount: number;
  };

  // Status
  isActive: boolean;

  // Auditing
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
