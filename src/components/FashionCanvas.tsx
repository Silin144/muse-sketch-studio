import { cn } from "@/lib/utils";
import { Sparkles, Loader2, Download, Play, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type DesignStep = 'prompt' | 'sketch' | 'colors' | 'model' | '3d' | 'runway';

interface DesignState {
  prompt: string;
  garmentType: string;
  gender: string;
  detailedFeatures: {
    shoulders: string;
    sleeves: string;
    waist: string;
    neckline: string;
    length: string;
    fit: string;
  };
  sketchUrl: string | null;
  coloredUrl: string | null;
  modelUrl: string | null;
  threeDUrl: string | null;
  angleViews?: Array<{ angle: string; imageUrl: string }>; // 6 different angle photos
  runwayUrl: string | null;
  selectedColors: string[];
  currentStep: DesignStep;
}

interface FashionCanvasProps {
  designState: DesignState;
  isGenerating?: boolean;
  currentOperation?: string;
  className?: string;
  onRegenerateSketch?: (newPrompt: string) => void;
}

export function FashionCanvas({ designState, isGenerating, currentOperation, className, onRegenerateSketch }: FashionCanvasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState(designState.prompt);
  
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegenerateSketch = () => {
    if (onRegenerateSketch && editPrompt.trim()) {
      onRegenerateSketch(editPrompt);
      setIsEditing(false);
    }
  };

  const renderContent = () => {
    // Loading state
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-text-muted animate-spin" />
          </div>
          <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
            {currentOperation || "Processing..."}
          </h3>
          <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed">
            Please wait while AI works its magic
          </p>
        </div>
      );
    }

    // Show final runway video if available
    if (designState.runwayUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <video 
                controls 
                className="w-full rounded-lg shadow-lg"
                poster={designState.modelUrl || undefined}
              >
                <source src={designState.runwayUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Runway Show Complete! 🎉
                </h3>
                <p className="text-sm text-text-secondary">
                  Your fashion design is ready for the world
                </p>
              </div>
              <Button
                onClick={() => downloadImage(designState.runwayUrl!, 'runway-video.mp4')}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show all 6 angle views if available
    if (designState.threeDUrl && designState.angleViews) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-4">
              {designState.angleViews.map((view, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={view.imageUrl} 
                    alt={`${view.angle} view`}
                    className="w-full h-auto object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {view.angle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  6 Angle Views Ready! 📐
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Create Ramp Walk Video" to continue
                </p>
              </div>
              <Button
                onClick={() => {
                  // Download all 6 views as a zip or first view
                  downloadImage(designState.angleViews![0].imageUrl, 'angle-views.png');
                }}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback: Show single 3D view if angleViews not available yet
    if (designState.threeDUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.threeDUrl} 
              alt="3D visualization of the design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Angle View Ready! 📐
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Create Ramp Walk Video" to continue
                </p>
              </div>
              <Button
                onClick={() => downloadImage(designState.threeDUrl!, 'angle-view.png')}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show model photo if available
    if (designState.modelUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.modelUrl} 
              alt="Model wearing the design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Model Photo Ready!
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Generate 3D View" to continue
                </p>
              </div>
              <Button
                onClick={() => downloadImage(designState.modelUrl!, 'model-photo.png')}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show colored design if available
    if (designState.coloredUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={designState.coloredUrl} 
              alt="Colored fashion design" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Colored Design Ready!
                </h3>
                <p className="text-sm text-text-secondary">
                  Click "Generate Model Photo" to continue
                </p>
              </div>
              <Button
                onClick={() => downloadImage(designState.coloredUrl!, 'colored-design.png')}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show sketch if available
    if (designState.sketchUrl) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 relative">
            <img 
              src={designState.sketchUrl} 
              alt="Fashion sketch" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
            
            {/* Edit Sketch Panel */}
            {isEditing && (
              <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border p-4 z-10">
                <h4 className="font-medium text-text-primary mb-3">Edit Sketch</h4>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Modify your design description..."
                  className="min-h-[100px] mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegenerateSketch}
                    size="sm"
                    disabled={!editPrompt.trim()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Edit Button */}
            {!isEditing && onRegenerateSketch && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
                className="absolute top-4 right-4"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Sketch
              </Button>
            )}
          </div>
          <div className="p-4 border-t border-border-subtle bg-surface-secondary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-dancing text-lg font-semibold text-text-primary">
                  Sketch Generated!
                </h3>
                <p className="text-sm text-text-secondary">
                  Choose colors in the sidebar to continue
                </p>
              </div>
              <Button
                onClick={() => downloadImage(designState.sketchUrl!, 'fashion-sketch.png')}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Initial state - no content yet
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-dancing font-semibold text-text-primary mb-2">
          Fashion Design Canvas
        </h3>
        <p className="text-text-secondary text-center max-w-xs font-roboto text-sm leading-relaxed mb-6">
          Start by entering a design prompt in the sidebar and clicking "Generate Sketch"
        </p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-surface-tertiary">
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-text-muted" />
            <div className="text-sm font-medium text-text-primary">AI Sketch</div>
            <div className="text-xs text-text-muted">Generate from prompt</div>
          </div>
          <div className="p-4 rounded-lg bg-surface-tertiary">
            <Play className="h-6 w-6 mx-auto mb-2 text-text-muted" />
            <div className="text-sm font-medium text-text-primary">Runway Video</div>
            <div className="text-xs text-text-muted">Complete pipeline</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex-1 bg-surface-primary",
      className
    )}>
      <div className="w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
}
