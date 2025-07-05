import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProcessingOptions } from "@shared/schema";

export function useVideoProcessor() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadVideoMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File; options: ProcessingOptions }) => {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("processingOptions", JSON.stringify(options));

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      queryClient.invalidateQueries({ queryKey: ["/api/videos/jobs"] });
      toast({
        title: "Upload successful",
        description: "Your video is being processed",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const processYouTubeMutation = useMutation({
    mutationFn: async ({ url, options }: { url: string; options: ProcessingOptions }) => {
      const response = await apiRequest("POST", "/api/videos/youtube", {
        youtubeUrl: url,
        processingOptions: options,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      queryClient.invalidateQueries({ queryKey: ["/api/videos/jobs"] });
      toast({
        title: "Processing started",
        description: "Your YouTube video is being processed",
      });
    },
    onError: (error) => {
      console.error("YouTube processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const uploadVideo = useCallback(
    (file: File, options: ProcessingOptions) => {
      uploadVideoMutation.mutate({ file, options });
    },
    [uploadVideoMutation]
  );

  const processYouTube = useCallback(
    (url: string, options: ProcessingOptions) => {
      processYouTubeMutation.mutate({ url, options });
    },
    [processYouTubeMutation]
  );

  return {
    currentJobId,
    uploadVideo,
    processYouTube,
    isUploading: uploadVideoMutation.isPending,
    isProcessingYouTube: processYouTubeMutation.isPending,
  };
}
