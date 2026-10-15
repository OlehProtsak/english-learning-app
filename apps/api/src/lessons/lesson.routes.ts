import { Router } from "express";
import { DatabaseError } from "pg";

import { createLessonSchema, updateLessonSchema } from "./lesson.schema.js";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonById,
} from "./lesson.service.js";

export const lessonRouter = Router();

lessonRouter.get("/:lessonId", async (req, res) => {
  const lessonId = Number(req.params.lessonId);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: "Invalid lesson ID",
    });
  }

  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }

  return res.json(lesson);
});

lessonRouter.post("/", async (req, res, next) => {
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
    const lesson = await createLesson(courseId, title, content);

    return res.status(201).json(lesson);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    next(error);
  }
});

lessonRouter.patch("/:lessonId", async (req, res, next) => {
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
    const lesson = await updateLesson(lessonId, courseId, title, content);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    return res.json(lesson);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    next(error);
  }
});

lessonRouter.delete("/:lessonId", async (req, res) => {
  const lessonId = Number(req.params.lessonId);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: "Invalid lesson ID",
    });
  }

  const lesson = await deleteLesson(lessonId);

  if (!lesson) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }

  return res.json(lesson);
});
