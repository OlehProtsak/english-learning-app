import { Router } from "express";
import { courses } from "./course.data.js";

export const courseRouter = Router();

courseRouter.get("/", (req, res) => {
  res.json(courses);
});

courseRouter.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }
  const course = courses.find((el) => el.id === id);

  if (!course) {
    return res.status(404).json({
      message: "Course not found",
    });
  }

  return res.json(course);
});
