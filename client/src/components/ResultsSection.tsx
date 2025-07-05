import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { VideoJob } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ResultsSectionProps {
  jobId: number;
}

export default function ResultsSection({ jobId }: ResultsSectionProps) {
  const { toast } = useToast();
  const { data: job, isLoading } = useQuery<VideoJob>({
    queryKey: ["/api/videos/job", jobId],
    refetchInterval: job?.status === "processing" ? 2000 : false,
  });

  if (isLoading || !job || job.status !== "completed") {
    return null;
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/videos/download/${jobId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `processed_${job.originalName || 'video.mp4'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your processed video is downloading",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Something went wrong while downloading the video",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ClipGenius - Processed Video",
          text: "Check out this video processed with ClipGenius!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      });
    }
  };

  const handleProcessAnother = () => {
    window.location.reload();
  };

  return (
    <section className="mt-12">
      <div className="bg-neutral rounded-xl p-6">
        <h3 className="text-2xl font-semibold mb-6 flex items-center">
          <i className="fas fa-check-circle text-accent mr-3"></i>
          Your Video is Ready!
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Final Video Preview */}
          <div className="space-y-4">
            <div className="aspect-[9/16] bg-gray-800 rounded-lg relative overflow-hidden max-w-sm mx-auto">
              {/* Mock final video preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-play text-white"></i>
                </div>
              </div>
              {/* Mock subtitles */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/80 rounded px-2 py-1 text-center">
                  <span className="text-white text-sm font-medium">Subtitles will appear here</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Final video: {job.processingOptions?.outputFormat || "9:16"} format, {job.processingOptions?.quality || "high"} quality
              </p>
            </div>
          </div>
          
          {/* Download Options */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Video Details</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span>{job.originalName || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span>{job.processingOptions?.outputFormat || "9:16"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span>{job.processingOptions?.quality || "high"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transcription:</span>
                  <span>{job.processingOptions?.autoTranscription ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scenes:</span>
                  <span>{job.scenes?.length || 0} detected</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                className="w-full bg-accent text-white hover:bg-emerald-600"
              >
                <i className="fas fa-download mr-2"></i>
                Download Video
              </Button>
              <Button
                onClick={handleShare}
                variant="secondary"
                className="w-full bg-gray-700 text-white hover:bg-gray-600"
              >
                <i className="fas fa-share-alt mr-2"></i>
                Share Link
              </Button>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleProcessAnother}
                className="text-primary hover:text-indigo-300 text-sm font-medium"
              >
                <i className="fas fa-redo mr-1"></i>
                Process Another Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
