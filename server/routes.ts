import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { videoProcessor } from "./services/videoProcessor";
import { insertVideoJobSchema, updateVideoJobSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload video file
  app.post("/api/videos/upload", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      const processingOptions = JSON.parse(req.body.processingOptions || '{}');
      const jobData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        processingOptions,
      };

      const validatedData = insertVideoJobSchema.parse(jobData);
      const job = await storage.createVideoJob(validatedData);

      // Start processing in background
      videoProcessor.processVideo(job.id).catch(console.error);

      res.json({ jobId: job.id, message: "Video uploaded successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Upload failed" });
    }
  });

  // Process YouTube URL
  app.post("/api/videos/youtube", async (req, res) => {
    try {
      const { youtubeUrl, processingOptions } = req.body;

      if (!youtubeUrl) {
        return res.status(400).json({ error: "YouTube URL is required" });
      }

      // Validate YouTube URL
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(youtubeUrl)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      // Create job first
      const jobData = {
        filename: `youtube_${Date.now()}.mp4`,
        originalName: "YouTube Video",
        youtubeUrl,
        processingOptions,
      };

      const validatedData = insertVideoJobSchema.parse(jobData);
      const job = await storage.createVideoJob(validatedData);

      // Note: YouTube download functionality requires additional setup due to YouTube's anti-bot measures
      // For production use, consider using YouTube API or premium yt-dlp configurations
      await storage.updateVideoJob(job.id, {
        status: "failed",
        errorMessage: "YouTube processing requires additional configuration. Please upload video files directly for now."
      });

      res.status(501).json({ 
        error: "YouTube processing requires additional setup due to YouTube's anti-bot protection. Please upload video files directly.",
        jobId: job.id 
      });
    } catch (error) {
      console.error("YouTube processing error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Processing failed" });
    }
  });

  // Get job status
  app.get("/api/videos/job/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getVideoJob(jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ error: "Failed to retrieve job" });
    }
  });

  // Get all jobs
  app.get("/api/videos/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllVideoJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ error: "Failed to retrieve jobs" });
    }
  });

  // Download processed video
  app.get("/api/videos/download/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getVideoJob(jobId);

      if (!job || !job.outputPath) {
        return res.status(404).json({ error: "Processed video not found" });
      }

      const outputDir = path.join(__dirname, "../output");
      const filePath = path.join(outputDir, job.outputPath);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Video file not found" });
      }

      res.download(filePath, `processed_${job.originalName || 'video.mp4'}`);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download video" });
    }
  });

  // Delete job
  app.delete("/api/videos/job/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const success = await storage.deleteVideoJob(jobId);

      if (!success) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Delete job error:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
