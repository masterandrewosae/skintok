import { useQuery } from "@tanstack/react-query";
import { VideoJob } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { getStatusIcon } from "@/lib/utils";

interface ProcessingStatusProps {
  jobId: number;
}

export default function ProcessingStatus({ jobId }: ProcessingStatusProps) {
  const { data: job, isLoading } = useQuery<VideoJob>({
    queryKey: ["/api/videos/job", jobId],
    refetchInterval: job?.status === "processing" ? 2000 : false,
  });

  if (isLoading || !job) {
    return (
      <div className="bg-neutral rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-2 bg-gray-700 rounded w-full mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded w-1/2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const processingSteps = [
    { key: "upload", label: "Video uploaded", completed: true },
    { key: "extract", label: "Audio extracted", completed: job.progress >= 30 },
    { key: "transcribe", label: "Transcribing audio...", completed: job.progress >= 60 },
    { key: "scenes", label: "Detecting scenes", completed: job.progress >= 80 },
    { key: "subtitles", label: "Adding subtitles", completed: job.progress >= 90 },
    { key: "final", label: "Generating final video", completed: job.progress >= 100 },
  ];

  const getCurrentStep = () => {
    if (job.status === "failed") return "Processing failed";
    if (job.status === "completed") return "Processing completed";
    
    const currentStep = processingSteps.find(step => !step.completed);
    return currentStep ? currentStep.label : "Processing...";
  };

  return (
    <div className="bg-neutral rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <i className={`${getStatusIcon(job.status)} text-primary mr-3`}></i>
        Processing Status
      </h3>
      
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getCurrentStep()}</span>
          <span className="text-sm text-accent">{job.progress}%</span>
        </div>
        <Progress value={job.progress} className="w-full" />
        
        {/* Error Message */}
        {job.status === "failed" && job.errorMessage && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">{job.errorMessage}</p>
          </div>
        )}
        
        {/* Processing Steps */}
        <div className="space-y-3">
          {processingSteps.map((step) => (
            <div key={step.key} className="flex items-center space-x-3">
              <i className={`${step.completed ? 'fas fa-check-circle text-accent' : 
                             job.status === 'processing' && !step.completed ? 'fas fa-spinner fa-spin text-primary' : 
                             'fas fa-circle text-gray-600'}`}></i>
              <span className={`text-sm ${step.completed ? 'text-gray-300' : 
                                        job.status === 'processing' && !step.completed ? 'text-white' : 
                                        'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
