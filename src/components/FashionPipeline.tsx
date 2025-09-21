import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeftOpen, Sparkles, Palette, User, Video, Check, Box } from "lucide-react";
import { cn } from "@/lib/utils";

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
  runwayUrl: string | null;
  selectedColors: string[];
  currentStep: DesignStep;
}

interface FashionPipelineProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  designState: DesignState;
  onDesignStateChange: (state: DesignState) => void;
  onGenerateSketch: () => void;
  onAddColors: () => void;
  onGenerateModel: () => void;
  onGenerate3D: () => void;
  onGenerateRunway: () => void;
  isGenerating: boolean;
  className?: string;
}

const garmentTypes = [
  "dress", "shirt", "pants", "skirt", "jacket", "coat", "hoodie", "t-shirt",
  "blazer", "jumpsuit", "shorts", "sweater", "cardigan", "vest", "kimono"
];

const genderOptions = ["Men", "Women", "Unisex"];

const detailedFeatureOptions = {
  shoulders: ["Regular", "Padded", "Dropped", "Structured", "Soft", "Wide"],
  sleeves: ["Short", "Long", "3/4", "Sleeveless", "Bell", "Puffed", "Fitted"],
  waist: ["Regular", "High-waisted", "Low-waisted", "Cinched", "Loose", "Fitted"],
  neckline: ["Round", "V-neck", "Scoop", "High neck", "Off-shoulder", "Boat neck"],
  length: ["Mini", "Knee-length", "Midi", "Maxi", "Floor-length", "Cropped"],
  fit: ["Slim", "Regular", "Loose", "Oversized", "Tailored", "Relaxed"]
};

const colorOptions = [
  { name: "Crimson Red", value: "#DC143C", hex: "#DC143C" },
  { name: "Royal Blue", value: "#4169E1", hex: "#4169E1" },
  { name: "Emerald", value: "#50C878", hex: "#50C878" },
  { name: "Golden Yellow", value: "#FFD700", hex: "#FFD700" },
  { name: "Deep Purple", value: "#663399", hex: "#663399" },
  { name: "Rose Pink", value: "#FF69B4", hex: "#FF69B4" },
  { name: "Sunset Orange", value: "#FF8C00", hex: "#FF8C00" },
  { name: "Midnight Black", value: "#000000", hex: "#000000" },
  { name: "Pearl White", value: "#F8F8FF", hex: "#F8F8FF" },
  { name: "Charcoal Gray", value: "#36454F", hex: "#36454F" },
  { name: "Chocolate Brown", value: "#7B3F00", hex: "#7B3F00" },
  { name: "Navy Blue", value: "#000080", hex: "#000080" },
  { name: "Mint Green", value: "#98FB98", hex: "#98FB98" },
  { name: "Rose Gold", value: "#E8B4B8", hex: "#E8B4B8" },
  { name: "Platinum Silver", value: "#E5E4E2", hex: "#E5E4E2" },
  { name: "Coral Reef", value: "#FF7F50", hex: "#FF7F50" }
];

const presetPrompts = [
  "Elegant evening gown with flowing silhouette",
  "Modern streetwear hoodie with geometric patterns",  
  "Classic tailored blazer with sharp shoulders",
  "Bohemian maxi dress with floral embroidery",
  "Minimalist white button-down shirt",
  "Avant-garde structured jacket with angular cuts",
  "Vintage-inspired A-line skirt with pleats",
  "Contemporary jumpsuit with wide-leg silhouette"
];

const steps = [
  { id: 'prompt', label: 'Design Prompt', icon: Sparkles, description: 'Describe your vision' },
  { id: 'sketch', label: 'Fashion Sketch', icon: Sparkles, description: 'AI-generated sketch' },
  { id: 'colors', label: 'Add Colors', icon: Palette, description: 'Choose color palette' },
  { id: 'model', label: 'Model Photo', icon: User, description: 'See it on a model' },
  { id: '3d', label: 'Different Angles', icon: Box, description: 'View from different angles' },
  { id: 'runway', label: 'Ramp Walk Video', icon: Video, description: 'Fashion ramp walk ready' }
];

export function FashionPipeline({ 
  isCollapsed, 
  onToggleCollapse, 
  designState, 
  onDesignStateChange,
  onGenerateSketch,
  onAddColors,
  onGenerateModel,
  onGenerate3D,
  onGenerateRunway,
  isGenerating,
  className 
}: FashionPipelineProps) {

  const updateDesignState = (updates: Partial<DesignState>) => {
    onDesignStateChange({ ...designState, ...updates });
  };

  const toggleColor = (colorName: string) => {
    const newColors = designState.selectedColors.includes(colorName)
      ? designState.selectedColors.filter(c => c !== colorName)
      : [...designState.selectedColors, colorName];
    updateDesignState({ selectedColors: newColors });
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === designState.currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case 'prompt': return !!designState.prompt;
      case 'sketch': return !!designState.sketchUrl;
      case 'colors': return !!designState.coloredUrl;
      case 'model': return !!designState.modelUrl;
      case '3d': return !!designState.threeDUrl;
      case 'runway': return !!designState.runwayUrl;
      default: return false;
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn(
        "w-12 border-r border-border-subtle bg-surface-secondary flex flex-col items-center py-4",
        className
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-8 h-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-96 border-r border-border-subtle bg-surface-secondary flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <h2 className="font-dancing text-xl font-semibold text-text-primary">
          Fashion Pipeline
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-8 h-8 p-0 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Progress Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-primary">Progress</h3>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      status === 'completed' && "bg-green-100 text-green-600",
                      status === 'current' && "bg-blue-100 text-blue-600",
                      status === 'pending' && "bg-gray-100 text-gray-400"
                    )}>
                      {status === 'completed' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={cn(
                        "text-sm font-medium",
                        status === 'current' && "text-text-primary",
                        status !== 'current' && "text-text-secondary"
                      )}>
                        {step.label}
                      </div>
                      <div className="text-xs text-text-muted">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1: Prompt Input */}
          {designState.currentStep === 'prompt' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 1: Design Prompt</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Garment Type
                  </label>
                  <Select value={designState.garmentType} onValueChange={(value) => updateDesignState({ garmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {garmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Gender
                  </label>
                  <Select value={designState.gender} onValueChange={(value) => updateDesignState({ gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map(gender => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Detailed Fashion Features */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-text-primary">Detailed Fashion Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(detailedFeatureOptions).map(([feature, options]) => (
                    <div key={feature}>
                      <label className="text-xs font-medium text-text-secondary mb-1 block capitalize">
                        {feature}
                      </label>
                      <Select 
                        value={designState.detailedFeatures[feature as keyof typeof designState.detailedFeatures]} 
                        onValueChange={(value) => updateDesignState({ 
                          detailedFeatures: { 
                            ...designState.detailedFeatures, 
                            [feature]: value 
                          } 
                        })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={`Select ${feature}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Describe your design
                </label>
                <Textarea
                  value={designState.prompt}
                  onChange={(e) => updateDesignState({ prompt: e.target.value })}
                  placeholder="Enter your fashion design description..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button 
                onClick={onGenerateSketch}
                disabled={!designState.prompt || isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Sketch
              </Button>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-primary">Preset Examples</h4>
                <div className="space-y-2">
                  {presetPrompts.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => updateDesignState({ prompt: preset })}
                      className="w-full p-2 text-left text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-subtle hover:border-border-default rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Color Selection */}
          {designState.currentStep === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 2: Choose Colors</h3>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary">
                  Select colors for your design
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md",
                        designState.selectedColors.includes(color.name) 
                          ? "border-blue-500 bg-blue-50 scale-95" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      title={color.name}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-text-primary">{color.name}</div>
                        <div className="text-xs text-text-muted">{color.hex}</div>
                      </div>
                      {designState.selectedColors.includes(color.name) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
                
                {designState.selectedColors.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-text-primary">Selected Colors:</div>
                    <div className="flex flex-wrap gap-2">
                      {designState.selectedColors.map(colorName => {
                        const colorObj = colorOptions.find(c => c.name === colorName);
                        return (
                          <div key={colorName} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: colorObj?.hex }}
                            />
                            <span className="text-xs text-text-secondary">{colorName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={onAddColors}
                disabled={isGenerating || designState.selectedColors.length === 0}
                className="w-full"
              >
                <Palette className="h-4 w-4 mr-2" />
                Add Colors
              </Button>
            </div>
          )}

          {/* Step 3: Model Generation */}
          {designState.currentStep === 'model' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 3: Generate Model Photo</h3>
              <p className="text-sm text-text-secondary">
                Create a professional model photo wearing your colored design.
              </p>

              <Button 
                onClick={onGenerateModel}
                disabled={isGenerating}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Generate Model Photo
              </Button>
            </div>
          )}

          {/* Step 4: Different Angle Views */}
          {designState.currentStep === '3d' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 4: View from Different Angles</h3>
              <p className="text-sm text-text-secondary">
                Generate views of your design from different angles for better perspective and detail viewing.
              </p>

              <Button 
                onClick={onGenerate3D}
                disabled={isGenerating}
                className="w-full"
              >
                <Box className="h-4 w-4 mr-2" />
                View Different Angles
              </Button>
            </div>
          )}

          {/* Step 5: Ramp Walk Video */}
          {designState.currentStep === 'runway' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 5: Create Ramp Walk Video</h3>
              <p className="text-sm text-text-secondary">
                Generate a professional ramp walk video with cameras flashing, showing the outfit from different angles.
              </p>

              <Button 
                onClick={onGenerateRunway}
                disabled={isGenerating}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Create Ramp Walk Video
              </Button>
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
