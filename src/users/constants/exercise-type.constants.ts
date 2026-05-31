export const EXERCISE_TYPES = [
  'gym',
  'running',
  'yoga_pilates',
  'swimming',
  'other',
] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];
