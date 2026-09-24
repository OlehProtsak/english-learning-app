import { Router } from "express";
import { courses } from "./course.data.js";

export const courseRouter = Router();

courseRouter.get("/", (req, res) => {
  res.json(courses);
});
