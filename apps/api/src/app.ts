import express from "express";

import { courseRouter } from "./courses/course.routes.js";
import { lessonRouter } from "./lessons/lesson.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/courses", courseRouter);
app.use("/api/lessons", lessonRouter);

app.use(errorHandler);
