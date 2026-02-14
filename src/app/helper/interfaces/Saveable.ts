// helper/interfaces/Saveable.ts
export type SaveType = 'job' | 'result' | 'admitCard' | 'answerKey';

export interface Saveable {
  type: SaveType;
  id: string;
}
