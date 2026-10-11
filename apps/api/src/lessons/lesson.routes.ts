import { Router } from "express";
import { DatabaseError } from "pg";

import { pool } from "../config/database.js";
import { createLessonSchema, updateLessonSchema } from "./lesson.schema.js";

export const lessonRouter = Router();

lessonRouter.get("/:lessonId", async (req, res) => {
  const lessonId = Number(req.params.lessonId);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: "Invalid lesson ID",
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, course_id, title, content FROM lessons WHERE id = $1",
      [lessonId],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

lessonRouter.post("/", async (req, res) => {
  const validationResult = createLessonSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((issue) => {
      return {
        field: issue.path.join("."),
        message: issue.message,
      };
    });

    return res.status(400).json({
      message: "Invalid lesson data",
      errors,
    });
  }

  const { courseId, title, content } = validationResult.data;

  try {
    const result = await pool.query(
      `
      INSERT INTO lessons (course_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id, course_id AS "courseId", title, content
      `,
      [courseId, title, content],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

lessonRouter.patch("/:lessonId", async (req, res) => {
  const lessonId = Number(req.params.lessonId);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: "Invalid lesson ID",
    });
  }

  const validationResult = updateLessonSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((issue) => {
      return {
        field: issue.path.join("."),
        message: issue.message,
      };
    });

    return res.status(400).json({
      message: "Invalid lesson data",
      errors,
    });
  }

  const { courseId, title, content } = validationResult.data;

  try {
    const result = await pool.query(
      `
      UPDATE lessons
      SET
        course_id = COALESCE($1, course_id),
        title = COALESCE($2, title),
        content = COALESCE($3, content)
      WHERE id = $4
      RETURNING id, course_id AS "courseId", title, content;
      `,
      [courseId ?? null, title ?? null, content ?? null, lessonId],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

lessonRouter.delete("/:lessonId", async (req, res) => {
  const lessonId = Number(req.params.lessonId);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: "Invalid lesson ID",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM lessons
       WHERE id = $1
       RETURNING id, course_id AS "courseId", title, content
      `,
      [lessonId],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
