import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videoJobs = pgTable("video_jobs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name"),
  youtubeUrl: text("youtube_url"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  progress: integer("progress").default(0),
  processingOptions: jsonb("processing_options").$type<ProcessingOptions>(),
  transcription: text("transcription"),
  scenes: jsonb("scenes").$type<Scene[]>(),
  outputPath: text("output_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProcessingOptions = {
  autoTranscription: boolean;
  sceneDetection: boolean;
  backgroundMusic: boolean;
  outputFormat: "9:16" | "16:9" | "1:1";
  quality: "high" | "medium" | "low";
};

export type Scene = {
  startTime: number;
  endTime: number;
  confidence: number;
  description?: string;
};

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVideoJobSchema = createInsertSchema(videoJobs).pick({
  filename: true,
  originalName: true,
  youtubeUrl: true,
  processingOptions: true,
}).extend({
  processingOptions: z.object({
    autoTranscription: z.boolean(),
    sceneDetection: z.boolean(),
    backgroundMusic: z.boolean(),
    outputFormat: z.enum(["9:16", "16:9", "1:1"]),
    quality: z.enum(["high", "medium", "low"]),
  }),
});

export const updateVideoJobSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  transcription: z.string().optional(),
  scenes: z.array(z.object({
    startTime: z.number(),
    endTime: z.number(),
    confidence: z.number(),
    description: z.string().optional(),
  })).optional(),
  outputPath: z.string().optional(),
  errorMessage: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VideoJob = typeof videoJobs.$inferSelect;
export type InsertVideoJob = z.infer<typeof insertVideoJobSchema>;
export type UpdateVideoJob = z.infer<typeof updateVideoJobSchema>;
