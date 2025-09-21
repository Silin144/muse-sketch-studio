import { useState } from "react";
import { FashionPipeline } from "@/components/FashionPipeline";
import { FashionCanvas } from "@/components/FashionCanvas";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

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

export default function FashionDesignTool() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [designState, setDesignState] = useState<DesignState>({
    prompt: "",
    garmentType: "dress",
    gender: "Women",
    detailedFeatures: {
      shoulders: "Regular",
      sleeves: "Long",
      waist: "Regular",
      neckline: "Round",
      length: "Knee-length",
      fit: "Regular"
    },
    sketchUrl: null,
    coloredUrl: null,
    modelUrl: null,
    threeDUrl: null,
    runwayUrl: null,
    selectedColors: [],
    currentStep: 'prompt'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>("");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-collapse sidebar on mobile
  const shouldCollapseSidebar = isMobile || isSidebarCollapsed;

  // Regenerate sketch with new prompt
  const handleRegenerateSketch = async (newPrompt: string) => {
    setDesignState(prev => ({ ...prev, prompt: newPrompt }));
    await generateSketch(newPrompt);
  };

  // Generate sketch function (extracted for reuse)
  const generateSketch = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a design description first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setCurrentOperation("Generating fashion sketch...");
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          garmentType: designState.garmentType,
          gender: designState.gender,
          detailedFeatures: designState.detailedFeatures
        })
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setDesignState(prev => ({
          ...prev,
          sketchUrl: data.imageUrl,
          currentStep: 'colors'
        }));
        toast({ title: "Sketch generated!", description: "Ready for coloring." });
      } else {
        throw new Error(data.error || 'Failed to generate sketch');
      }
    } catch (error) {
      handleApiError(error, "sketch generation");
    } finally {
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  // Step 1: Generate Sketch (wrapper)
  const handleGenerateSketch = async () => {
    await generateSketch(designState.prompt);
  };

  // Step 2: Add Colors
  const handleAddColors = async () => {
    if (!designState.sketchUrl) return;

    setIsGenerating(true);
    setCurrentOperation("Adding colors to design...");
    
    try {
      const response = await fetch('http://localhost:3001/api/add-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sketchUrl: designState.sketchUrl,
          colors: designState.selectedColors,
          prompt: designState.prompt
        })
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setDesignState(prev => ({
          ...prev,
          coloredUrl: data.imageUrl,
          currentStep: 'model'
        }));
        toast({ title: "Colors added!", description: "Ready for model generation." });
      } else {
        throw new Error(data.error || 'Failed to add colors');
      }
    } catch (error) {
      handleApiError(error, "color generation");
    } finally {
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  // Step 3: Generate Model Photo
  const handleGenerateModel = async () => {
    if (!designState.coloredUrl) return;

    setIsGenerating(true);
    setCurrentOperation("Creating model photo...");
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          designUrl: designState.coloredUrl,
          modelType: "diverse fashion model",
          pose: "standing"
        })
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setDesignState(prev => ({
          ...prev,
          modelUrl: data.imageUrl,
          currentStep: '3d'
        }));
        toast({ title: "Model photo created!", description: "Ready for 3D visualization." });
      } else {
        throw new Error(data.error || 'Failed to generate model photo');
      }
    } catch (error) {
      handleApiError(error, "model generation");
    } finally {
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  // Step 4: Generate Different Angle Views
  const handleGenerateAngles = async () => {
    if (!designState.modelUrl) return;

    setIsGenerating(true);
    setCurrentOperation("Creating different angle views...");
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelPhotoUrl: designState.modelUrl,
          garmentType: designState.garmentType,
          detailedFeatures: designState.detailedFeatures
        })
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setDesignState(prev => ({
          ...prev,
          threeDUrl: data.imageUrl,
          currentStep: 'runway'
        }));
        toast({ title: "3D view created!", description: "Ready for runway video." });
      } else {
        throw new Error(data.error || 'Failed to generate 3D view');
      }
    } catch (error) {
      handleApiError(error, "3D generation");
    } finally {
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  // Step 5: Generate Ramp Walk Video
  const handleGenerateRunway = async () => {
    if (!designState.modelUrl) return;

    setIsGenerating(true);
    setCurrentOperation("Creating ramp walk video... (this may take a few minutes)");
    
    try {
      const response = await fetch('http://localhost:3001/api/generate-ramp-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modelPhotoUrl: designState.modelUrl,
          walkStyle: "confident ramp walk"
        })
      });

      const data = await response.json();
      
      if (data.success && data.videoUrl) {
        setDesignState(prev => ({
          ...prev,
          runwayUrl: data.videoUrl
        }));
        toast({ title: "Runway video created!", description: "Your fashion show is ready!" });
      } else {
        throw new Error(data.error || 'Failed to generate runway video');
      }
    } catch (error) {
      handleApiError(error, "runway video generation");
    } finally {
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  const handleApiError = (error: unknown, operation: string) => {
    console.error(`${operation} error:`, error);
    
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      toast({
        title: "Server not running",
        description: "Please start the API server with 'npm run server'",
        variant: "destructive"
      });
    } else {
      toast({
        title: `${operation} failed`,
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleUndo = () => {
    console.log("Undo action");
    // TODO: Implement undo functionality
  };

  const handleDownload = () => {
    console.log("Download design");
    // TODO: Implement download functionality
  };

  return (
    <div className="h-screen bg-surface-primary flex flex-col font-roboto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-secondary">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/home")}
            className="text-text-secondary hover:text-text-primary"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
        <h1 className="font-dancing text-2xl font-semibold text-text-primary">
          Muse Sketch Studio
        </h1>
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <FashionPipeline
          isCollapsed={shouldCollapseSidebar}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          designState={designState}
          onDesignStateChange={setDesignState}
          onGenerateSketch={handleGenerateSketch}
          onAddColors={handleAddColors}
          onGenerateModel={handleGenerateModel}
          onGenerate3D={handleGenerateAngles}
          onGenerateRunway={handleGenerateRunway}
          isGenerating={isGenerating}
        />
        
        {/* Canvas Area */}
        <FashionCanvas 
          designState={designState}
          isGenerating={isGenerating}
          currentOperation={currentOperation}
          onRegenerateSketch={handleRegenerateSketch}
        />
      </div>
    </div>
  );
}