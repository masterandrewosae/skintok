import { storage } from "../storage";
import { transcribeAudio, analyzeVideoContent } from "./openai";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VideoProcessor {
  private uploadsDir: string;
  private outputDir: string;

  constructor() {
    this.uploadsDir = path.join(__dirname, "../../uploads");
    this.outputDir = path.join(__dirname, "../../output");
    
    // Ensure directories exist
    [this.uploadsDir, this.outputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async processYouTubeVideo(jobId: number, youtubeUrl: string): Promise<void> {
    const job = await storage.getVideoJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      await storage.updateVideoJob(jobId, { status: "processing", progress: 5 });

      // Download YouTube video using yt-dlp
      const videoPath = await this.downloadYouTubeVideo(youtubeUrl, job.filename);
      await storage.updateVideoJob(jobId, { progress: 20 });

      // Process the downloaded video
      await this.processVideoFile(jobId, videoPath);

    } catch (error) {
      console.error(`Error processing YouTube video ${jobId}:`, error);
      await storage.updateVideoJob(jobId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  private async downloadYouTubeVideo(youtubeUrl: string, filename: string): Promise<string> {
    const outputPath = path.join(this.uploadsDir, filename);
    
    return new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '--format', 'worst[ext=mp4]/worst', // Use worst quality to avoid throttling
        '--output', outputPath,
        '--no-playlist',
        '--no-check-certificate',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        youtubeUrl
      ]);

      let stderr = '';
      let stdout = '';
      
      ytdlp.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('yt-dlp stderr:', data.toString());
      });

      ytdlp.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('yt-dlp stdout:', data.toString());
      });

      ytdlp.on('close', (code) => {
        console.log(`yt-dlp exited with code ${code}`);
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`YouTube download failed. Code: ${code}. Error: ${stderr}. Output: ${stdout}`));
        }
      });

      ytdlp.on('error', (error) => {
        reject(new Error(`yt-dlp process error: ${error.message}`));
      });
    });
  }

  private async processVideoFile(jobId: number, inputPath: string): Promise<void> {
    const job = await storage.getVideoJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const audioPath = path.join(this.uploadsDir, `${job.id}_audio.wav`);
    
    // Extract audio from video
    await this.extractAudio(inputPath, audioPath);
    await storage.updateVideoJob(jobId, { progress: 30 });

    let transcription = "";
    let scenes: any[] = [];

    if (job.processingOptions?.autoTranscription) {
      // Transcribe audio using OpenAI Whisper
      const transcriptionResult = await transcribeAudio(audioPath);
      transcription = transcriptionResult.text;
      await storage.updateVideoJob(jobId, { transcription, progress: 60 });

      if (job.processingOptions?.sceneDetection) {
        // Analyze content for scene detection
        const analysis = await analyzeVideoContent(transcription);
        scenes = analysis.scenes;
        await storage.updateVideoJob(jobId, { scenes, progress: 80 });
      }
    }

    // Generate final video
    const outputPath = await this.generateFinalVideo(
      inputPath,
      transcription,
      scenes,
      job.processingOptions!
    );

    await storage.updateVideoJob(jobId, {
      status: "completed",
      progress: 100,
      outputPath: path.basename(outputPath),
    });

    // Clean up temporary files
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }

  async processVideo(jobId: number): Promise<void> {
    const job = await storage.getVideoJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      await storage.updateVideoJob(jobId, { status: "processing", progress: 10 });

      const inputPath = path.join(this.uploadsDir, job.filename);
      
      // Process the uploaded video file
      await this.processVideoFile(jobId, inputPath);

    } catch (error) {
      console.error(`Error processing video ${jobId}:`, error);
      await storage.updateVideoJob(jobId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  private async extractAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        '-y',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async generateFinalVideo(
    inputPath: string,
    transcription: string,
    scenes: any[],
    options: any
  ): Promise<string> {
    const outputFilename = `processed_${Date.now()}.mp4`;
    const outputPath = path.join(this.outputDir, outputFilename);

    return new Promise((resolve, reject) => {
      let args = ['-i', inputPath];
      let videoFilter = '';

      // Set resolution based on quality and format
      if (options.outputFormat === "9:16") {
        const resolution = options.quality === "high" ? "1080:1920" :
                          options.quality === "medium" ? "720:1280" : "480:854";
        videoFilter = `scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`;
      } else if (options.outputFormat === "1:1") {
        const resolution = options.quality === "high" ? "1080:1080" :
                          options.quality === "medium" ? "720:720" : "480:480";
        videoFilter = `scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2`;
      } else {
        // 16:9 format - keep original aspect ratio for now
        videoFilter = '';
      }

      // Add subtitle overlay if transcription exists
      if (transcription && options.autoTranscription) {
        const subtitlePath = path.join(this.outputDir, `subtitles_${Date.now()}.srt`);
        this.generateSubtitleFile(transcription, subtitlePath);
        videoFilter += `,subtitles=${subtitlePath.replace(/\\/g, '/')}:force_style='Alignment=2,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=2'`;
      }

      if (videoFilter) {
        args.push('-vf', videoFilter);
      }

      args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-y', outputPath);

      console.log('FFmpeg command:', ['ffmpeg', ...args].join(' '));

      const ffmpeg = spawn('ffmpeg', args);

      let stderr = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`FFmpeg exited with code ${code}. Error: ${stderr}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(new Error(`FFmpeg process error: ${error.message}`));
      });
    });
  }

  private generateSubtitleFile(transcription: string, outputPath: string): void {
    // Simple subtitle generation - split transcription into chunks
    const words = transcription.split(' ');
    const wordsPerSubtitle = 8;
    let srtContent = '';
    
    for (let i = 0; i < words.length; i += wordsPerSubtitle) {
      const chunk = words.slice(i, i + wordsPerSubtitle).join(' ');
      const startTime = Math.floor(i / wordsPerSubtitle) * 3;
      const endTime = startTime + 3;
      
      srtContent += `${Math.floor(i / wordsPerSubtitle) + 1}\n`;
      srtContent += `${this.formatTime(startTime)} --> ${this.formatTime(endTime)}\n`;
      srtContent += `${chunk}\n\n`;
    }
    
    fs.writeFileSync(outputPath, srtContent);
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},000`;
  }
}

export const videoProcessor = new VideoProcessor();
