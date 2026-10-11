import { Router } from "express";
import { DatabaseError } from "pg";

import { createCourseSchema, updateCourseSchema } from "./course.schema.js";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getLessonsByCourseId,
} from "./course.service.js";

export const courseRouter = Router();

courseRouter.get("/", async (req, res) => {
  try {
    const courses = await getAllCourses();

    return res.json(courses);
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
    const course = await getCourseById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json(course);
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
    const lessons = await getLessonsByCourseId(courseId);

    return res.json(lessons);
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
    const course = await createCourse(title, description, level);

    return res.status(201).json(course);
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

  const { title, description, level } = validationResult.data;

  try {
    const course = await updateCourse(courseId, title, description, level);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json(course);
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
    const course = await deleteCourse(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json(course);
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
