// helper/interfaces/Shareable.ts
export type ShareType = 'job' | 'admitCard' | 'result' | 'answerKey';

export interface Shareable {
  type: ShareType;
  title: string;
  slug: string;
  description?: string;
}
