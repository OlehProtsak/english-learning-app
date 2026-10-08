import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});
