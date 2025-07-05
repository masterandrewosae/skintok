import { useState, useRef } from "react";
import { formatFileSize } from "@/lib/utils";

interface VideoPreviewProps {
  video: File;
}

export default function VideoPreview({ video }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-neutral rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <i className="fas fa-play text-primary mr-3"></i>
        Video Preview
      </h3>
      
      <div className="aspect-video bg-gray-800 rounded-lg mb-4 relative overflow-hidden">
        <video
          ref={videoRef}
          src={URL.createObjectURL(video)}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-white text-xl`}></i>
          </div>
        </button>
        
        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1 bg-gray-600 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Duration: {formatTime(duration)}</span>
        <span>Size: {formatFileSize(video.size)}</span>
        <span>Format: {video.type.split('/')[1].toUpperCase()}</span>
      </div>
    </div>
  );
}
