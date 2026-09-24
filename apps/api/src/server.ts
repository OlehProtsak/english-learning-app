import express from "express";
import { courses } from "./courses/course.data.js";

const app = express();
const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});

app.get("/api/courses", (req, res) => {
  res.json(courses);
});
