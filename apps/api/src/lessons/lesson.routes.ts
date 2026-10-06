import { Router } from "express";
import { pool } from "../config/database.js";

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
