// State interface updated
export interface IState {
  id: number;
  stateName: string;
  slug: string;

  shortCode?: string;
  region?: string;
  description?: string;

  priorityOrder: number;
  isActive: boolean;

  // Instead of loading full relations, use counts
  stats?: {
    jobsCount: number;
    admitCardsCount: number;
    resultsCount: number;
    answerKeysCount: number;
    organizationsCount: number;
    newsCount: number;
  };

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}