import { z } from "zod";
export const projectSchema = z.object({ name:z.string().min(2), description:z.string().min(10), platform:z.enum(["Web","Mobile","Desktop","API","SaaS"]), priority:z.enum(["Low","Medium","High","Urgent"]), deadline:z.string().optional(), tags:z.array(z.string()).default([]) });
export const authSchema = z.object({ email:z.string().email(), password:z.string().min(8) });
