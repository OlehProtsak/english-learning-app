import { DatabaseError } from "pg";
import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof DatabaseError && err.code === "23503") {
    return res.status(409).json({
      message: "Foreign key constraint violation",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};
