import { pool } from "../config/database.js";

export const getLessonById = async (id: number) => {
  const result = await pool.query(
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
) => {
  const result = await pool.query(
    `
    INSERT INTO lessons (course_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING id, course_id AS "courseId", title, content
    `,
    [courseId, title, content],
  );

  return result.rows[0];
};

export const updateLesson = async (
  lessonId: number,
  courseId: number | undefined,
  title: string | undefined,
  content: string | undefined,
) => {
  const result = await pool.query(
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

export const deleteLesson = async (lessonId: number) => {
  const result = await pool.query(
    `
    DELETE FROM lessons
    WHERE id = $1
    RETURNING id, course_id AS "courseId", title, content
    `,
    [lessonId],
  );

  return result.rows[0];
};
