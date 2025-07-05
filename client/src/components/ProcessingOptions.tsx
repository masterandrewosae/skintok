import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ProcessingOptions as ProcessingOptionsType } from "@shared/schema";

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onChange: (options: ProcessingOptionsType) => void;
}

export default function ProcessingOptions({ options, onChange }: ProcessingOptionsProps) {
  const updateOption = (key: keyof ProcessingOptionsType, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-neutral rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <i className="fas fa-cog text-primary mr-3"></i>
        Processing Options
      </h3>
      
      <div className="space-y-4">
        {/* Auto Transcription */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-closed-captioning text-primary mr-3"></i>
            <span className="font-medium">Auto Transcription</span>
          </div>
          <Switch
            checked={options.autoTranscription}
            onCheckedChange={(checked) => updateOption("autoTranscription", checked)}
          />
        </div>

        {/* Scene Detection */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-cut text-primary mr-3"></i>
            <span className="font-medium">Scene Detection</span>
          </div>
          <Switch
            checked={options.sceneDetection}
            onCheckedChange={(checked) => updateOption("sceneDetection", checked)}
          />
        </div>

        {/* Background Music */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-music text-primary mr-3"></i>
            <span className="font-medium">Background Music</span>
          </div>
          <Switch
            checked={options.backgroundMusic}
            onCheckedChange={(checked) => updateOption("backgroundMusic", checked)}
          />
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">Output Format</Label>
          <Select
            value={options.outputFormat}
            onValueChange={(value: "9:16" | "16:9" | "1:1") => updateOption("outputFormat", value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9:16">9:16 (TikTok/Instagram)</SelectItem>
              <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
              <SelectItem value="1:1">1:1 (Square)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-300">Quality</Label>
          <Select
            value={options.quality}
            onValueChange={(value: "high" | "medium" | "low") => updateOption("quality", value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High (1080p)</SelectItem>
              <SelectItem value="medium">Medium (720p)</SelectItem>
              <SelectItem value="low">Low (480p)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
