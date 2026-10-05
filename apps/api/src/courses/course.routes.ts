import { Router } from "express";
import { pool } from "../config/database.js";

export const courseRouter = Router();

courseRouter.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, title, description, level FROM courses",
  );

  return res.json(result.rows);
});

courseRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

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
});
