import { pool } from "../config/database.js";
import { Course, Level } from "./course.types.js";

export const getAllCourses = async (): Promise<Course[]> => {
  const result = await pool.query<Course>(
    "SELECT id, title, description, level FROM courses",
  );

  return result.rows;
};

export const getCourseById = async (
  id: number,
): Promise<Course | undefined> => {
  const result = await pool.query<Course>(
    `
    SELECT id, title, description, level
    FROM courses
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

export const createCourse = async (
  title: string,
  description: string,
  level: Level,
): Promise<Course> => {
  const result = await pool.query<Course>(
    `
    INSERT INTO courses(title, description, level)
    VALUES ($1, $2, $3)
    RETURNING id, title, description, level
    `,
    [title, description, level],
  );

  return result.rows[0];
};

export const updateCourse = async (
  id: number,
  title: string | undefined,
  description: string | undefined,
  level: Level | undefined,
): Promise<Course | undefined> => {
  const result = await pool.query<Course>(
    `
    UPDATE courses
    SET 
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      level = COALESCE($3, level)
    WHERE id = $4
    RETURNING id, title, description, level
    `,
    [title ?? null, description ?? null, level ?? null, id],
  );

  return result.rows[0];
};

export const deleteCourse = async (id: number): Promise<Course | undefined> => {
  const result = await pool.query<Course>(
    `
    DELETE FROM courses
    WHERE id = $1
    RETURNING id, title, description, level
    `,
    [id],
  );

  return result.rows[0];
};

export const getLessonsByCourseId = async (courseId: number) => {
  const result = await pool.query(
    `
    SELECT id, course_id, title, content
    FROM lessons
    WHERE course_id = $1

    `,
    [courseId],
  );

  return result.rows;
};
