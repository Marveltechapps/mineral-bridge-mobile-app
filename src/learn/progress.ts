import { LEARN } from '../lib/catalog';

export function lessonKey(catIdx: number, lessonIdx: number): string {
  return `${catIdx}:${lessonIdx}`;
}

export function lessonIsDone(
  catIdx: number,
  lessonIdx: number,
  baked: boolean | undefined,
  extra: readonly string[],
): boolean {
  return !!baked || extra.includes(lessonKey(catIdx, lessonIdx));
}

export function countLessonsDone(extra: readonly string[]): number {
  return LEARN.reduce(
    (n, section, catIdx) =>
      n + section.lessons.filter((lesson, i) => lessonIsDone(catIdx, i, lesson.done, extra)).length,
    0,
  );
}
