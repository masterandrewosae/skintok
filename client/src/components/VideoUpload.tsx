import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProcessingOptions } from "@shared/schema";

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  onJobCreated: (jobId: number) => void;
  processingOptions: ProcessingOptions;
}

export default function VideoUpload({ onVideoUpload, onJobCreated, processingOptions }: VideoUploadProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 500MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an MP4, MOV, or AVI file",
        variant: "destructive",
      });
      return;
    }

    onVideoUpload(file);
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("processingOptions", JSON.stringify(processingOptions));

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onJobCreated(data.jobId);
      
      toast({
        title: "Upload successful",
        description: "Your video is being processed",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiRequest("POST", "/api/videos/youtube", {
        youtubeUrl,
        processingOptions,
      });

      const data = await response.json();
      onJobCreated(data.jobId);
      
      toast({
        title: "Processing started",
        description: "Your YouTube video is being processed",
      });
    } catch (error) {
      console.error("YouTube processing error:", error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary");
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="bg-neutral rounded-xl p-6 mb-6">
      <h3 className="text-2xl font-semibold mb-6 flex items-center">
        <i className="fas fa-upload text-primary mr-3"></i>
        Upload Your Video
      </h3>
      
      {/* Upload Tabs */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === "upload" ? "default" : "secondary"}
          onClick={() => setActiveTab("upload")}
          className={activeTab === "upload" ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}
        >
          <i className="fas fa-file-upload mr-2"></i>
          Upload File
        </Button>
        <Button
          variant={activeTab === "youtube" ? "default" : "secondary"}
          onClick={() => setActiveTab("youtube")}
          className={activeTab === "youtube" ? "bg-primary text-white" : "bg-gray-700 text-gray-300"}
        >
          <i className="fab fa-youtube mr-2"></i>
          YouTube URL
        </Button>
      </div>

      {/* File Upload */}
      {activeTab === "upload" && (
        <div
          className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-primary transition-colors bg-gray-800/50 cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p className="text-lg font-medium mb-2">Drag & drop your video here</p>
          <p className="text-gray-400 mb-4">Supports MP4, MOV, AVI up to 500MB</p>
          <Button 
            className="bg-primary text-white hover:bg-indigo-600"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              "Choose File"
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* YouTube Input */}
      {activeTab === "youtube" && (
        <div className="space-y-4">
          <Input
            type="url"
            placeholder="Paste YouTube URL here..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white focus:border-primary"
          />
          <Button 
            onClick={handleYoutubeSubmit}
            className="bg-primary text-white hover:bg-indigo-600"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-download mr-2"></i>
                Fetch Video
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
