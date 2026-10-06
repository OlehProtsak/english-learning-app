import { Router } from "express";
import { pool } from "../config/database.js";

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
