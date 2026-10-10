import { z } from "zod";

export const createLessonSchema = z.object({
  courseId: z.int().positive(),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
});
