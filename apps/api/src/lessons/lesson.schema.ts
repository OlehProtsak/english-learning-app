import { z } from "zod";

export const createLessonSchema = z.object({
  courseId: z.int().positive(),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const updateLessonSchema = createLessonSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
