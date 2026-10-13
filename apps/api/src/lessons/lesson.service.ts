import { pool } from "../config/database.js";
import { Lesson } from "./lesson.types.js";

export const getLessonById = async (
  id: number,
): Promise<Lesson | undefined> => {
  const result = await pool.query<Lesson>(
    `
    SELECT id, course_id AS "courseId", title, content
    FROM lessons
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

export const createLesson = async (
  courseId: number,
  title: string,
  content: string,
): Promise<Lesson> => {
  const result = await pool.query<Lesson>(
    `
    INSERT INTO lessons (course_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING id, course_id AS "courseId", title, content
    `,
    [courseId, title, content],
  );

  const lesson = result.rows[0];

  if (!lesson) {
    throw new Error("Failed to create lesson");
  }

  return lesson;
};

export const updateLesson = async (
  lessonId: number,
  courseId: number | undefined,
  title: string | undefined,
  content: string | undefined,
): Promise<Lesson | undefined> => {
  const result = await pool.query<Lesson>(
    `
    UPDATE lessons
    SET
      course_id = COALESCE($1, course_id),
      title = COALESCE($2, title),
      content = COALESCE($3, content)
    WHERE id = $4
    RETURNING id, course_id AS "courseId", title, content
    `,
    [courseId ?? null, title ?? null, content ?? null, lessonId],
  );

  return result.rows[0];
};

export const deleteLesson = async (
  lessonId: number,
): Promise<Lesson | undefined> => {
  const result = await pool.query<Lesson>(
    `
    DELETE FROM lessons
    WHERE id = $1
    RETURNING id, course_id AS "courseId", title, content
    `,
    [lessonId],
  );

  return result.rows[0];
};
