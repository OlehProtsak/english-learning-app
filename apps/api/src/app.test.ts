import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";

import type { Course } from "./courses/course.types.js";

import * as courseService from "./courses/course.service.js";

vi.mock("./courses/course.service.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./courses/course.service.js")>();

  return {
    ...actual,
    getCourseById: vi.fn(),
    createCourse: vi.fn(),
    getAllCourses: vi.fn(),
    updateCourse: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /health", () => {
  it("should return 200 and status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/courses/:id", () => {
  it("should return 400 for an invalid course ID", async () => {
    const response = await request(app).get("/api/courses/abc");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid course ID" });
  });

  it("should return 400 for a negative course ID", async () => {
    const response = await request(app).get("/api/courses/-5");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid course ID" });
  });

  it("should return 200 and a course when the course exists", async () => {
    const mockCourse: Course = {
      id: 1,
      title: "English Basics",
      description: "Learn basic English",
      level: "A1",
    };

    vi.mocked(courseService.getCourseById).mockResolvedValue(mockCourse);

    const response = await request(app).get("/api/courses/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourse);
    expect(courseService.getCourseById).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("should return 404 when the course does not exist", async () => {
    vi.mocked(courseService.getCourseById).mockResolvedValue(undefined);
    const response = await request(app).get("/api/courses/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found" });
    expect(courseService.getCourseById).toHaveBeenCalledExactlyOnceWith(999);
  });

  it("should return 500 when the course service fails", async () => {
    vi.mocked(courseService.getCourseById).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app).get("/api/courses/1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal server error",
    });
    expect(courseService.getCourseById).toHaveBeenCalledExactlyOnceWith(1);
  });
});

describe("POST /api/courses", () => {
  it("should return 400 when the course title is empty", async () => {
    const invalidCourse = {
      title: "",
      description: "Learn English",
      level: "A1",
    };

    const response = await request(app)
      .post("/api/courses")
      .send(invalidCourse);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid course data");

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: "title",
      }),
    );
    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it("should create a course when data is valid", async () => {
    const validCourse = {
      title: "English Basics",
      description: "Learn basic English",
      level: "A1" as const,
    };

    const { title, description, level } = validCourse;

    const createdCourse = {
      id: 1,
      ...validCourse,
    };

    vi.mocked(courseService.createCourse).mockResolvedValue(createdCourse);

    const response = await request(app).post("/api/courses").send(validCourse);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdCourse);
    expect(courseService.createCourse).toHaveBeenCalledExactlyOnceWith(
      title,
      description,
      level,
    );
  });

  it("should return 400 when the course level is invalid", async () => {
    const invalidCourse = {
      title: "English Basics",
      description: "Learn basic English",
      level: "D1",
    };

    const response = await request(app)
      .post("/api/courses")
      .send(invalidCourse);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid course data");
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: "level",
      }),
    );
    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it("should return 400 when the course description is missing", async () => {
    const invalidCourse = {
      title: "English Basics",
      level: "A1",
    };

    const response = await request(app)
      .post("/api/courses")
      .send(invalidCourse);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid course data");
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: "description",
      }),
    );
    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it("should return 500 when the course creation service fails", async () => {
    const validCourse = {
      title: "English Basics",
      description: "Learn basic English",
      level: "A1" as const,
    };

    const { title, description, level } = validCourse;

    vi.mocked(courseService.createCourse).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app).post("/api/courses").send(validCourse);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error" });
    expect(courseService.createCourse).toHaveBeenCalledExactlyOnceWith(
      title,
      description,
      level,
    );
  });
});

describe("GET /api/courses", () => {
  it("should return 200 and an empty array when no courses exist", async () => {
    vi.mocked(courseService.getAllCourses).mockResolvedValue([]);

    const response = await request(app).get("/api/courses");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(courseService.getAllCourses).toHaveBeenCalledOnce();
  });

  it("should return 200 and all courses when courses exist", async () => {
    const courses = [
      {
        id: 1,
        title: "English Basics",
        description: "Beginner course",
        level: "A1" as const,
      },
      {
        id: 2,
        title: "Everyday English",
        description: "Elementary course",
        level: "A2" as const,
      },
    ];

    vi.mocked(courseService.getAllCourses).mockResolvedValue(courses);

    const response = await request(app).get("/api/courses");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(courses);
    expect(courseService.getAllCourses).toHaveBeenCalledOnce();
  });

  it("should return 500 when fetching courses fails", async () => {
    vi.mocked(courseService.getAllCourses).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app).get("/api/courses");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error" });
    expect(courseService.getAllCourses).toHaveBeenCalledOnce();
  });
});

describe("PATCH /api/courses/:courseId", () => {
  it("should return 400 when the course ID is invalid", async () => {
    const response = await request(app)
      .patch("/api/courses/abc")
      .send({ title: "Updated Title" });

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      message: "Invalid course ID",
    });
  });

  it("should return 200 when a course is updated successfully", async () => {
    const updatedCourse = {
      id: 1,
      title: "Updated Title",
      description: "Beginner course",
      level: "A1" as const,
    };

    vi.mocked(courseService.updateCourse).mockResolvedValue(updatedCourse);

    const response = await request(app)
      .patch("/api/courses/1")
      .send({ title: "Updated Title" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedCourse);

    expect(courseService.updateCourse).toHaveBeenCalledExactlyOnceWith(
      1,
      "Updated Title",
      undefined,
      undefined,
    );
  });

  it("should return 404 when the course does not exist", async () => {
    vi.mocked(courseService.updateCourse).mockResolvedValue(undefined);

    const response = await request(app)
      .patch("/api/courses/999")
      .send({ title: "Updated Title" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Course not found" });
    expect(courseService.updateCourse).toHaveBeenCalledExactlyOnceWith(
      999,
      "Updated Title",
      undefined,
      undefined,
    );
  });

  it("should return 400 when the course title is empty", async () => {
    const response = await request(app)
      .patch("/api/courses/1")
      .send({ title: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid course data");
    expect(courseService.updateCourse).not.toHaveBeenCalled();
  });

  it("should return 400 when no update fields are provided", async () => {
    const response = await request(app).patch("/api/courses/1").send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        message: "At least one field must be provided",
      }),
    );
    expect(courseService.updateCourse).not.toHaveBeenCalled();
  });

  it("should ignore unknown fields when updating a course", async () => {
    const updatedCourse = {
      id: 1,
      title: "Updated Title",
      description: "Beginner course",
      level: "A1" as const,
    };

    vi.mocked(courseService.updateCourse).mockResolvedValue(updatedCourse);

    const response = await request(app).patch("/api/courses/1").send({
      title: "Updated Title",
      unknownField: "something",
    });

    expect(response.status).toBe(200);
    expect(courseService.updateCourse).toHaveBeenCalledExactlyOnceWith(
      1,
      "Updated Title",
      undefined,
      undefined,
    );
    expect(response.body).toEqual(updatedCourse);
  });

  it("should return 500 when updating a course fails", async () => {
    vi.mocked(courseService.updateCourse).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await request(app).patch("/api/courses/1").send({
      title: "Updated Title",
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Internal server error",
    });
    expect(courseService.updateCourse).toHaveBeenCalledExactlyOnceWith(
      1,
      "Updated Title",
      undefined,
      undefined,
    );
  });
});
