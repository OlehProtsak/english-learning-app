import { Router } from "express";
import { DatabaseError } from "pg";

import { pool } from "../config/database.js";
import { createCourseSchema, updateCourseSchema } from "./course.schema.js";

export const courseRouter = Router();

courseRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, level FROM courses",
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

courseRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, title, description, level FROM courses WHERE id = $1",
      [id],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Course not found",
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

courseRouter.get("/:courseId/lessons", async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, course_id, title, content FROM lessons WHERE course_id = $1",
      [courseId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

courseRouter.post("/", async (req, res) => {
  const validationResult = createCourseSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((issue) => {
      return {
        field: issue.path.join("."),
        message: issue.message,
      };
    });

    return res.status(400).json({
      message: "Invalid course data",
      errors,
    });
  }

  const { title, description, level } = validationResult.data;

  try {
    const result = await pool.query(
      "INSERT INTO courses (title, description, level) VALUES ($1, $2, $3) RETURNING id, title, description, level",
      [title, description, level],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

courseRouter.patch("/:courseId", async (req, res) => {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  const validationResult = updateCourseSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((issue) => {
      return {
        field: issue.path.join("."),
        message: issue.message,
      };
    });

    return res.status(400).json({
      message: "Invalid course data",
      errors,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE courses
       SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          level = COALESCE($3, level)
       WHERE id = $4
       RETURNING id, title, description, level`,
      [
        validationResult.data.title ?? null,
        validationResult.data.description ?? null,
        validationResult.data.level ?? null,
        courseId,
      ],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Course not found",
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

courseRouter.delete("/:courseId", async (req, res) => {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM courses
       WHERE id = $1
       RETURNING id, title, description, level
      `,
      [courseId],
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete a course that has lessons",
      });
    }
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
