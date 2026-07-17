import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters").max(80, "Project name must be 80 characters or fewer"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(500, "Description must be 500 characters or fewer"),
  platform: z.enum(["Web", "Mobile", "Desktop", "API", "SaaS"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  deadline: z.string().nullable().default(null),
});

export const projectSchema = createProjectSchema.extend({
  tags: z.array(z.string().trim().min(1)).default([]),
});

export const authSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
