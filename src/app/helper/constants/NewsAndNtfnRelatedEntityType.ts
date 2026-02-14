export const NewsAndNtfnRelatedEntityType = {
  JOB_POSTING: "job_posting",
  EXAM_NOTIFICATION: "exam_notification",
  ADMIT_CARD: "admit_card",
  RESULT: "result",
  ANSWER_KEY: "answer_key",
  NOTICE: "notice",
  UPDATE: "update",
} as const;

export type NewsAndNtfnRelatedEntityType =
  typeof NewsAndNtfnRelatedEntityType[keyof typeof NewsAndNtfnRelatedEntityType];