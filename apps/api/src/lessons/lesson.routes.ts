import { Router } from "express";
import { pool } from "../config/database.js";

export const lessonRouter = Router();

lessonRouter.get("/:courseId/lessons", async (req, res) => {
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
