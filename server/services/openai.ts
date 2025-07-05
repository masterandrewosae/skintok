import OpenAI from "openai";
import fs from "fs";
import path from "path";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export async function transcribeAudio(audioFilePath: string): Promise<{ text: string, duration: number }> {
  try {
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "json",
      language: "en",
    });

    return {
      text: transcription.text,
      duration: 0, // Duration is not returned by OpenAI Whisper API
    };
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeVideoContent(transcription: string): Promise<{
  scenes: Array<{ startTime: number; endTime: number; confidence: number; description: string }>;
  highlights: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a video content analyzer. Analyze the transcription and identify the most engaging scenes for short-form content. 
          Return a JSON object with:
          - scenes: Array of scenes with startTime, endTime (in seconds), confidence (0-1), and description
          - highlights: Array of key phrases or topics that make the content engaging
          
          Focus on identifying moments with high engagement potential for social media.`
        },
        {
          role: "user",
          content: `Analyze this video transcription and identify the best scenes for short-form content:\n\n${transcription}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      scenes: result.scenes || [],
      highlights: result.highlights || [],
    };
  } catch (error) {
    console.error("Error analyzing video content:", error);
    throw new Error(`Failed to analyze video content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
