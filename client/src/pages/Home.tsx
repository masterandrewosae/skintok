import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoUpload from "@/components/VideoUpload";
import ProcessingOptions from "@/components/ProcessingOptions";
import ProcessingStatus from "@/components/ProcessingStatus";
import VideoPreview from "@/components/VideoPreview";
import ResultsSection from "@/components/ResultsSection";
import { ProcessingOptions as ProcessingOptionsType } from "@shared/schema";

export default function Home() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptionsType>({
    autoTranscription: true,
    sceneDetection: true,
    backgroundMusic: false,
    outputFormat: "9:16",
    quality: "high",
  });

  const handleVideoUpload = (file: File) => {
    setUploadedVideo(file);
  };

  const handleJobCreated = (jobId: number) => {
    setCurrentJobId(jobId);
  };

  return (
    <div className="min-h-screen bg-secondary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            AI-Powered Video Editing
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your videos into engaging short-form content with automatic transcription, scene detection, and subtitle generation.
          </p>
        </section>

        {/* Video Editor */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <VideoUpload 
              onVideoUpload={handleVideoUpload}
              onJobCreated={handleJobCreated}
              processingOptions={processingOptions}
            />
            
            {uploadedVideo && (
              <VideoPreview video={uploadedVideo} />
            )}
          </div>

          {/* Processing Panel */}
          <div className="space-y-6">
            <ProcessingOptions 
              options={processingOptions}
              onChange={setProcessingOptions}
            />
            
            {currentJobId && (
              <ProcessingStatus jobId={currentJobId} />
            )}
          </div>
        </div>

        {/* Results Section */}
        {currentJobId && (
          <ResultsSection jobId={currentJobId} />
        )}

        {/* Features Section */}
        <section className="mt-16">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose ClipGenius?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered</h4>
              <p className="text-gray-300">Advanced AI automatically detects the best scenes and generates accurate subtitles.</p>
            </div>
            <div className="bg-neutral rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mobile-alt text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-semibold mb-2">Mobile-First</h4>
              <p className="text-gray-300">Optimized for mobile devices with vertical video format perfect for social media.</p>
            </div>
            <div className="bg-neutral rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lightning-bolt text-white text-2xl"></i>
              </div>
              <h4 className="text-xl font-semibold mb-2">Lightning Fast</h4>
              <p className="text-gray-300">Process videos in minutes, not hours. Get your content ready for sharing instantly.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
