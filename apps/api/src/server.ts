import express from "express";
import { courseRouter } from "./courses/course.routes.js";

const app = express();
const PORT = 3000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/courses", courseRouter);

app.listen(PORT, () => {
  console.log(`API is running on http://localhost:${PORT}`);
});
