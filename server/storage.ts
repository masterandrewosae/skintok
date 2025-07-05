import { users, videoJobs, type User, type InsertUser, type VideoJob, type InsertVideoJob, type UpdateVideoJob } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createVideoJob(job: InsertVideoJob): Promise<VideoJob>;
  getVideoJob(id: number): Promise<VideoJob | undefined>;
  updateVideoJob(id: number, updates: UpdateVideoJob): Promise<VideoJob | undefined>;
  getAllVideoJobs(): Promise<VideoJob[]>;
  deleteVideoJob(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videoJobs: Map<number, VideoJob>;
  private currentUserId: number;
  private currentVideoJobId: number;

  constructor() {
    this.users = new Map();
    this.videoJobs = new Map();
    this.currentUserId = 1;
    this.currentVideoJobId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createVideoJob(insertJob: InsertVideoJob): Promise<VideoJob> {
    const id = this.currentVideoJobId++;
    const now = new Date();
    const job: VideoJob = {
      id,
      filename: insertJob.filename,
      originalName: insertJob.originalName || null,
      youtubeUrl: insertJob.youtubeUrl || null,
      processingOptions: insertJob.processingOptions || null,
      status: "pending",
      progress: 0,
      transcription: null,
      scenes: null,
      outputPath: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    };
    this.videoJobs.set(id, job);
    return job;
  }

  async getVideoJob(id: number): Promise<VideoJob | undefined> {
    return this.videoJobs.get(id);
  }

  async updateVideoJob(id: number, updates: UpdateVideoJob): Promise<VideoJob | undefined> {
    const job = this.videoJobs.get(id);
    if (!job) return undefined;

    const updatedJob: VideoJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };
    this.videoJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getAllVideoJobs(): Promise<VideoJob[]> {
    return Array.from(this.videoJobs.values());
  }

  async deleteVideoJob(id: number): Promise<boolean> {
    return this.videoJobs.delete(id);
  }
}

export const storage = new MemStorage();
