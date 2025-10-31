import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeftOpen, Sparkles, Palette, User, Video, Check, Box, Upload, Image as ImageIcon, Save, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveToPortfolio } from "@/pages/Portfolio";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type DesignStep = 'prompt' | 'sketch' | 'colors' | 'model' | '3d' | 'runway';

interface DesignState {
  prompt: string;
  category: string;
  garmentType: string;
  gender: string;
  detailedFeatures: {
    shoulders: string;
    sleeves: string;
    waist: string;
    neckline: string;
    length: string;
    fit: string;
    fabric: string;
    pattern: string;
    embellishments: string;
    closure: string;
    collar: string;
    hemStyle: string;
    pockets: string;
    backDetail: string;
  };
  sketchUrl: string | null;
  coloredUrl: string | null;
  modelUrl: string | null;
  threeDUrl: string | null;
  runwayUrl: string | null;
  selectedColors: string[];
  currentStep: DesignStep;
  previousSketchUrl: string | null; // For edit history
  previousColoredUrl: string | null; // For edit history
  uploadedImageUrl: string | null; // User uploaded image
  uploadedLogoUrl: string | null; // User uploaded logo
  useUploadedImage: boolean; // Flag to use uploaded image instead of generation
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
  onEditColors: () => void; // New: regenerate with different colors
  isGenerating: boolean;
  className?: string;
}

// Categories/Occasions
const categories = [
  "Wedding & Formal Events",
  "Business & Professional",
  "Casual Everyday",
  "Streetwear & Urban",
  "Athletic & Sportswear",
  "Evening & Cocktail",
  "Bohemian & Festival",
  "Luxury & High Fashion",
  "Resort & Vacation",
  "Traditional & Cultural"
];

// Garments mapped by category
const garmentsByCategory: Record<string, string[]> = {
  "Wedding & Formal Events": ["tuxedo", "gown", "suit", "formal dress", "blazer", "jacket", "dress shirt", "bow tie outfit"],
  "Business & Professional": ["blazer", "suit", "jacket", "dress shirt", "pencil skirt", "tailored pants", "vest", "business dress"],
  "Casual Everyday": ["jacket", "t-shirt", "jeans", "casual dress", "cardigan", "sweater", "hoodie", "casual shirt"],
  "Streetwear & Urban": ["hoodie", "joggers", "bomber jacket", "jacket", "graphic tee", "cargo pants", "track jacket", "oversized shirt"],
  "Athletic & Sportswear": ["tracksuit", "leggings", "sports bra", "athletic shorts", "windbreaker", "tank top", "athletic jacket"],
  "Evening & Cocktail": ["cocktail dress", "evening gown", "dress shirt", "blazer", "jacket", "jumpsuit", "midi dress", "formal pants"],
  "Bohemian & Festival": ["maxi dress", "kimono", "flowy skirt", "crop top", "wide-leg pants", "kaftan", "embroidered vest"],
  "Luxury & High Fashion": ["designer coat", "statement dress", "structured blazer", "haute couture gown", "luxury jacket", "jacket"],
  "Resort & Vacation": ["sundress", "linen shirt", "shorts", "beach cover-up", "casual jumpsuit", "vacation skirt"],
  "Traditional & Cultural": ["kimono", "kurta", "sari blouse", "traditional dress", "ethnic jacket", "cultural gown"]
};

const genderOptions = ["Men", "Women", "Unisex"];

// Features relevant to specific garment types (comprehensive)
const garmentFeatureMap: Record<string, string[]> = {
  "tuxedo": ["shoulders", "sleeves", "fit", "length", "fabric", "closure", "collar", "pockets"],
  "gown": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "suit": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "closure", "pockets"],
  "formal dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail"],
  "blazer": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "closure", "collar", "pockets"],
  "jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "closure", "collar", "pockets"],
  "dress shirt": ["shoulders", "sleeves", "neckline", "fit", "fabric", "pattern", "closure", "collar", "pockets"],
  "bow tie outfit": ["shoulders", "sleeves", "fit", "fabric", "collar"],
  "pencil skirt": ["waist", "length", "fit", "fabric", "pattern", "closure", "hemStyle", "pockets"],
  "tailored pants": ["waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "vest": ["shoulders", "fit", "length", "fabric", "pattern", "closure", "pockets"],
  "business dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "t-shirt": ["sleeves", "neckline", "fit", "length", "fabric", "pattern"],
  "jeans": ["waist", "length", "fit", "fabric", "closure", "pockets"],
  "casual dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "pockets"],
  "cardigan": ["sleeves", "length", "fit", "fabric", "pattern", "closure"],
  "sweater": ["sleeves", "neckline", "fit", "length", "fabric", "pattern"],
  "hoodie": ["sleeves", "fit", "length", "fabric", "pattern", "closure", "pockets"],
  "casual shirt": ["sleeves", "neckline", "fit", "fabric", "pattern", "closure", "collar", "pockets"],
  "joggers": ["waist", "length", "fit", "fabric", "closure", "pockets"],
  "bomber jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "closure", "pockets"],
  "graphic tee": ["sleeves", "neckline", "fit", "fabric", "pattern"],
  "cargo pants": ["waist", "length", "fit", "fabric", "closure", "pockets"],
  "track jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "closure", "pockets"],
  "oversized shirt": ["sleeves", "length", "fit", "fabric", "pattern", "closure"],
  "tracksuit": ["sleeves", "waist", "length", "fit", "fabric", "closure", "pockets"],
  "leggings": ["waist", "length", "fit", "fabric", "pattern"],
  "sports bra": ["fit", "fabric", "pattern"],
  "athletic shorts": ["waist", "length", "fit", "fabric", "closure", "pockets"],
  "windbreaker": ["shoulders", "sleeves", "fit", "length", "fabric", "closure", "pockets"],
  "tank top": ["neckline", "fit", "length", "fabric", "pattern"],
  "athletic jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "closure", "pockets"],
  "cocktail dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "evening gown": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "jumpsuit": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "midi dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "hemStyle"],
  "formal pants": ["waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "maxi dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "kimono": ["sleeves", "length", "fit", "fabric", "pattern", "embellishments", "closure"],
  "flowy skirt": ["waist", "length", "fit", "fabric", "pattern", "closure", "hemStyle"],
  "crop top": ["sleeves", "neckline", "fit", "fabric", "pattern", "embellishments"],
  "wide-leg pants": ["waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "kaftan": ["sleeves", "length", "fit", "fabric", "pattern", "embellishments"],
  "embroidered vest": ["shoulders", "fit", "length", "fabric", "embellishments", "closure"],
  "designer coat": ["shoulders", "sleeves", "length", "fit", "fabric", "pattern", "closure", "collar", "pockets"],
  "statement dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "structured blazer": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "closure", "collar", "pockets"],
  "haute couture gown": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"],
  "luxury jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "closure", "pockets"],
  "sundress": ["neckline", "sleeves", "length", "fit", "fabric", "pattern", "embellishments", "hemStyle"],
  "linen shirt": ["sleeves", "neckline", "fit", "fabric", "closure", "collar", "pockets"],
  "shorts": ["waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "beach cover-up": ["sleeves", "length", "fit", "fabric", "pattern"],
  "casual jumpsuit": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "closure", "pockets"],
  "vacation skirt": ["waist", "length", "fit", "fabric", "pattern", "closure", "hemStyle"],
  "kurta": ["sleeves", "neckline", "length", "fit", "fabric", "pattern", "embellishments", "collar"],
  "sari blouse": ["sleeves", "neckline", "fit", "fabric", "pattern", "embellishments", "backDetail"],
  "traditional dress": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail"],
  "ethnic jacket": ["shoulders", "sleeves", "fit", "length", "fabric", "pattern", "embellishments", "closure"],
  "cultural gown": ["neckline", "sleeves", "waist", "length", "fit", "fabric", "pattern", "embellishments", "backDetail", "hemStyle"]
};

// Comprehensive garment-specific options for features
const detailedFeatureOptions = {
  shoulders: ["Regular", "Padded", "Dropped", "Structured", "Soft", "Wide", "Natural", "Extended"],
  sleeves: ["Short", "Long", "3/4", "Sleeveless", "Bell", "Puffed", "Fitted", "Balloon", "Bishop", "Raglan", "Dolman", "Cap", "Flutter"],
  waist: ["Regular", "High-waisted", "Low-waisted", "Cinched", "Loose", "Fitted", "Empire", "Natural", "Dropped", "Belted"],
  neckline: ["Round", "V-neck", "Scoop", "High neck", "Off-shoulder", "Boat neck", "Collar", "Mandarin", "Square", "Halter", "Sweetheart", "Asymmetric", "Cowl", "Keyhole"],
  fit: ["Slim", "Regular", "Loose", "Oversized", "Tailored", "Relaxed", "Body-con", "A-line", "Straight", "Flared"],
  
  // New detailed options
  fabric: ["Cotton", "Silk", "Wool", "Linen", "Velvet", "Satin", "Chiffon", "Denim", "Leather", "Suede", "Cashmere", "Tweed", "Jersey", "Organza", "Tulle", "Lace", "Brocade", "Crepe"],
  pattern: ["Solid", "Floral", "Geometric", "Stripes", "Polka dots", "Checkered", "Paisley", "Abstract", "Animal print", "Tie-dye", "Ombre", "Color block", "Herringbone", "Houndstooth"],
  embellishments: ["None", "Beading", "Sequins", "Embroidery", "Lace details", "Ruffles", "Pleats", "Rhinestones", "Pearls", "Fringe", "Appliqué", "Cutouts", "Studs", "Bows", "Rosettes"],
  closure: ["Button", "Zipper", "Hook & eye", "Snap", "Tie", "Toggle", "Magnetic", "Velcro", "Lace-up", "Open front", "Elastic", "Drawstring"],
  collar: ["No collar", "Pointed", "Spread", "Button-down", "Mandarin", "Peter Pan", "Shawl", "Notched", "Wing", "Band", "Chelsea", "Cuban", "Camp"],
  hemStyle: ["Straight", "Curved", "Asymmetric", "Raw edge", "Rolled", "Lettuce edge", "Scalloped", "Handkerchief", "High-low", "Fringed", "Tapered"],
  pockets: ["No pockets", "Side pockets", "Patch pockets", "Welt pockets", "Flap pockets", "Cargo pockets", "Hidden pockets", "Kangaroo pocket", "Chest pocket"],
  backDetail: ["Plain", "Open back", "Keyhole", "Tie-back", "Zipper", "Buttons", "Lace-up", "Cutout", "Ruched", "Draped", "Slit", "Low back"]
};

// Length options specific to garment types
const lengthOptionsMap: Record<string, string[]> = {
  // Suits, Blazers, Jackets, Coats
  "suit": ["Regular", "Short", "Long", "Extra Long"],
  "tuxedo": ["Regular", "Short", "Long"],
  "blazer": ["Regular", "Cropped", "Long", "Boyfriend"],
  "jacket": ["Regular", "Cropped", "Long", "Hip-length"],
  "bomber jacket": ["Cropped", "Regular", "Oversized"],
  "luxury jacket": ["Regular", "Long", "Oversized"],
  "ethnic jacket": ["Regular", "Long", "Knee-length"],
  "athletic jacket": ["Regular", "Long"],
  "track jacket": ["Regular", "Cropped"],
  "designer coat": ["Knee-length", "Midi", "Long", "Floor-length"],
  
  // Dresses & Gowns
  "dress": ["Mini", "Knee-length", "Midi", "Maxi", "Floor-length"],
  "gown": ["Floor-length", "Maxi", "Train"],
  "formal dress": ["Knee-length", "Midi", "Maxi", "Floor-length"],
  "casual dress": ["Mini", "Knee-length", "Midi"],
  "cocktail dress": ["Mini", "Knee-length", "Midi"],
  "evening gown": ["Floor-length", "Maxi", "Train"],
  "business dress": ["Knee-length", "Midi"],
  "maxi dress": ["Maxi", "Floor-length"],
  "midi dress": ["Midi", "Knee-length"],
  "sundress": ["Mini", "Knee-length", "Midi"],
  "statement dress": ["Mini", "Knee-length", "Midi", "Maxi"],
  "traditional dress": ["Knee-length", "Midi", "Maxi", "Floor-length"],
  "cultural gown": ["Floor-length", "Maxi"],
  "haute couture gown": ["Floor-length", "Train"],
  
  // Shirts & Tops
  "shirt": ["Regular", "Cropped", "Long", "Tunic"],
  "dress shirt": ["Regular", "Long"],
  "casual shirt": ["Regular", "Cropped"],
  "oversized shirt": ["Regular", "Long", "Oversized"],
  "linen shirt": ["Regular", "Long"],
  "t-shirt": ["Cropped", "Regular", "Long", "Oversized"],
  "graphic tee": ["Cropped", "Regular", "Oversized"],
  "tank top": ["Cropped", "Regular"],
  "crop top": ["Cropped", "Regular"],
  "sports bra": ["Regular", "Cropped"], // Sports bras typically don't have length, but for completeness
  
  // Pants & Bottoms
  "pants": ["Ankle", "Regular", "Long"],
  "tailored pants": ["Regular", "Long", "Cropped"],
  "jeans": ["Ankle", "Regular", "Long"],
  "joggers": ["Ankle", "Regular", "Long"],
  "cargo pants": ["Regular", "Long"],
  "formal pants": ["Regular", "Long"],
  "wide-leg pants": ["Ankle", "Regular", "Long", "Floor-length"],
  "leggings": ["Ankle", "Regular", "Full-length"],
  "shorts": ["Mini", "Bermuda", "Knee-length"],
  "athletic shorts": ["Mini", "Knee-length"],
  
  // Skirts
  "skirt": ["Mini", "Knee-length", "Midi", "Maxi"],
  "pencil skirt": ["Knee-length", "Midi"],
  "flowy skirt": ["Knee-length", "Midi", "Maxi"],
  "vacation skirt": ["Mini", "Knee-length", "Midi"],
  
  // Other garments
  "jumpsuit": ["Ankle", "Regular", "Long"],
  "casual jumpsuit": ["Ankle", "Regular"],
  "hoodie": ["Cropped", "Regular", "Long", "Oversized"],
  "sweater": ["Cropped", "Regular", "Long", "Oversized"],
  "cardigan": ["Regular", "Long", "Midi", "Maxi"],
  "vest": ["Cropped", "Regular", "Long"],
  "embroidered vest": ["Regular", "Long"],
  "kimono": ["Knee-length", "Midi", "Maxi", "Floor-length"],
  "kaftan": ["Midi", "Maxi", "Floor-length"],
  "tracksuit": ["Regular", "Long"],
  "windbreaker": ["Regular", "Long"],
  "bow tie outfit": ["Regular"],
  "kurta": ["Knee-length", "Long", "Ankle"],
  "sari blouse": ["Cropped", "Regular"],
  "beach cover-up": ["Mini", "Knee-length", "Midi", "Maxi"],
  "structured blazer": ["Regular", "Long"]
};

// Helper to get length options for a garment
const getLengthOptions = (garmentType: string): string[] => {
  return lengthOptionsMap[garmentType] || ["Regular", "Short", "Long"];
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
  "Oversized hoodie with all-over sleeve pattern, clean chest area",
  "Black hoodie with bold center chest graphic, colorful sleeve design",  
  "Streetwear hoodie with creative sleeve graphics",
  "Modern hoodie with front center branding, patterned sleeves",
  "Luxury hoodie with oversized back print",
  "Fashion blazer with bold lapel details, creative trim accents",
  "Designer hoodie with asymmetric graphic placement",
  "Contemporary hoodie with repeating pattern on sleeves"
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
  onEditColors,
  isGenerating,
  className 
}: FashionPipelineProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateDesignState = (updates: Partial<DesignState>) => {
    onDesignStateChange({ ...designState, ...updates });
  };

  // Save current design to portfolio
  const handleSaveToPortfolio = () => {
    if (!designState.sketchUrl && !designState.coloredUrl && !designState.modelUrl) {
      toast({
        title: "Nothing to save yet",
        description: "Generate at least a sketch first!",
        variant: "destructive"
      });
      return;
    }

    try {
      saveToPortfolio({
        name: `${designState.garmentType || 'Design'} - ${new Date().toLocaleDateString()}`,
        category: designState.category,
        garmentType: designState.garmentType,
        gender: designState.gender,
        prompt: designState.prompt,
        sketchUrl: designState.sketchUrl,
        coloredUrl: designState.coloredUrl,
        modelUrl: designState.modelUrl,
        runwayUrl: designState.runwayUrl,
        angleViews: designState.angleViews,
        colors: designState.selectedColors
      });

      toast({
        title: "Saved to Portfolio! 🎉",
        description: "Your design has been saved successfully.",
        action: <Button size="sm" variant="outline" onClick={() => navigate('/portfolio')}>
          <FolderOpen className="h-4 w-4 mr-2" />
          View Portfolio
        </Button>
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save to portfolio. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleColor = (colorName: string) => {
    const newColors = designState.selectedColors.includes(colorName)
      ? designState.selectedColors.filter(c => c !== colorName)
      : [...designState.selectedColors, colorName];
    updateDesignState({ selectedColors: newColors });
  };

  // Get filtered garment types based on category
  const getAvailableGarments = () => {
    if (!designState.category) return [];
    return garmentsByCategory[designState.category] || [];
  };

  // Get relevant features for current garment type
  const getRelevantFeatures = () => {
    if (!designState.garmentType) return [];
    return garmentFeatureMap[designState.garmentType] || [];
  };

  // Handle category change - reset garment type
  const handleCategoryChange = (category: string) => {
    updateDesignState({ 
      category, 
      garmentType: "" // Reset garment when category changes
    });
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
              
              {/* Upload Image Option */}
              <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Your Own Image (Optional)
                  </label>
                  {designState.uploadedImageUrl && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updateDesignState({ uploadedImageUrl: null, useUploadedImage: false })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-text-muted">
                  Start with your own photo or sketch instead of AI generation
                </p>
                
                {!designState.uploadedImageUrl ? (
                  <div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateDesignState({ 
                              uploadedImageUrl: reader.result as string,
                              useUploadedImage: true 
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="image-upload">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        type="button"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={designState.uploadedImageUrl} 
                      alt="Uploaded" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Uploaded ✓
                    </Badge>
                  </div>
                )}
              </div>

              {/* Add Logo Option */}
              <div className="space-y-3 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Add Logo/Graphics (Optional)
                  </label>
                  {designState.uploadedLogoUrl && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => updateDesignState({ uploadedLogoUrl: null })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                
                <p className="text-xs text-text-muted">
                  Upload brand logo or graphic to add to your design
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  💡 Tip: DON'T mention brand names in your prompt - just upload the logo and describe the style!
                </p>
                
                {!designState.uploadedLogoUrl ? (
                  <div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            updateDesignState({ uploadedLogoUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="logo-upload">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={designState.uploadedLogoUrl} 
                      alt="Logo" 
                      className="w-full h-20 object-contain rounded-md bg-white p-2"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-500">
                      Logo ✓
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Category Selection */}
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  Category / Occasion
                </label>
                <Select value={designState.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Garment Type (filtered by category) */}
              {designState.category && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-2 block">
                      Garment Type
                    </label>
                    <Select 
                      value={designState.garmentType} 
                      onValueChange={(value) => updateDesignState({ garmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select garment" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableGarments().map(type => (
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
              )}

              {/* Detailed Fashion Features (conditional based on garment) */}
              {designState.garmentType && getRelevantFeatures().length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-text-primary">Detailed Fashion Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getRelevantFeatures().map((feature) => {
                      // Get options - use garment-specific length if feature is length
                      let options;
                      if (feature === 'length') {
                        options = getLengthOptions(designState.garmentType);
                      } else {
                        options = detailedFeatureOptions[feature as keyof typeof detailedFeatureOptions];
                      }
                      
                      return (
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
                      );
                    })}
                  </div>
                </div>
              )}

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

              {/* Save to Portfolio */}
              {designState.coloredUrl && (
                <Button 
                  onClick={handleSaveToPortfolio}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Portfolio
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Model Generation */}
          {designState.currentStep === 'model' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 3: Generate Model Photo</h3>
              <p className="text-sm text-text-secondary">
                Create a professional model photo wearing your colored design.
              </p>

              {/* Edit Options */}
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">Want to refine?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => {
                        updateDesignState({ currentStep: 'prompt' });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Edit Sketch
                    </Button>
                    <Button 
                      onClick={() => {
                        updateDesignState({ currentStep: 'colors' });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Edit Colors
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onGenerateModel}
                disabled={isGenerating}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Generate Model Photo
              </Button>

              {/* Save to Portfolio */}
              {designState.modelUrl && (
                <Button 
                  onClick={handleSaveToPortfolio}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Portfolio
                </Button>
              )}
            </div>
          )}

          {/* Step 4: Different Angle Views */}
          {designState.currentStep === '3d' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 4: View from Different Angles</h3>
              <p className="text-sm text-text-secondary">
                Generate 6 different angle views of your design for complete perspective.
              </p>

              {/* Edit Options */}
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium text-text-primary">Want to refine?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => {
                        updateDesignState({ currentStep: 'prompt' });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Edit Sketch
                    </Button>
                    <Button 
                      onClick={() => {
                        updateDesignState({ currentStep: 'colors' });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Edit Colors
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onGenerate3D}
                disabled={isGenerating}
                className="w-full"
              >
                <Box className="h-4 w-4 mr-2" />
                Generate 6 Angle Views
              </Button>
            </div>
          )}

          {/* Step 5: Ramp Walk Video */}
          {designState.currentStep === 'runway' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-primary">Step 5: Create Ramp Walk Video</h3>
              <p className="text-sm text-text-secondary">
                Generate a professional 10-second ramp walk video with cameras flashing. Processing takes 5-20 minutes.
              </p>

              <Button 
                onClick={onGenerateRunway}
                disabled={isGenerating}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Create Ramp Walk Video
              </Button>

              {/* Save to Portfolio */}
              {designState.runwayUrl && (
                <Button 
                  onClick={handleSaveToPortfolio}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save to Portfolio
                </Button>
              )}
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
