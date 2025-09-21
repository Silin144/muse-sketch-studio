import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, User, Video, ArrowRight, Stars } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Sparkles, label: "Sketch", description: "AI generates professional fashion sketches" },
    { icon: Palette, label: "Color", description: "Add vibrant colors with intelligent palette" },
    { icon: User, label: "Model", description: "See your design on professional models" },
    { icon: Video, label: "Runway", description: "Create stunning runway show videos" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const handleGetStarted = () => {
    navigate("/design");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-tertiary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 mb-8 shadow-strong">
            <Stars className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="font-dancing text-6xl md:text-7xl font-bold text-text-primary mb-4 tracking-tight">
            Muse Sketch Studio
          </h1>
          
          <p className="font-roboto text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Transform your fashion ideas into reality with AI-powered design tools. 
            From concept to runway in minutes.
          </p>
        </div>

        {/* Animated Pipeline Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-8 md:space-x-12 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 mb-3
                    ${isActive 
                      ? 'bg-text-primary text-surface-primary shadow-strong scale-110' 
                      : 'bg-surface-tertiary text-text-muted hover:bg-surface-secondary'
                    }
                  `}>
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  <div className="text-center">
                    <div className={`
                      font-roboto font-semibold text-sm mb-1 transition-colors duration-500
                      ${isActive ? 'text-text-primary' : 'text-text-secondary'}
                    `}>
                      {step.label}
                    </div>
                    
                    <div className={`
                      font-roboto text-xs max-w-24 leading-tight transition-opacity duration-500
                      ${isActive ? 'text-text-secondary opacity-100' : 'text-text-muted opacity-70'}
                    `}>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-1 bg-surface-tertiary rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gray-800 to-gray-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleGetStarted}
          size="lg"
          className="
            font-roboto font-semibold text-lg px-12 py-6 h-auto
            bg-text-primary text-surface-primary 
            hover:bg-text-secondary hover:scale-105 
            transition-all duration-300 shadow-strong
            group
          "
        >
          Start Designing
          <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="text-center p-6 rounded-lg bg-surface-secondary/50 backdrop-blur-sm border border-border-subtle hover:bg-surface-secondary transition-colors">
            <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="font-roboto font-semibold text-text-primary mb-2">AI-Powered</h3>
            <p className="font-roboto text-sm text-text-secondary leading-relaxed">
              Professional-grade AI models create stunning fashion designs from your descriptions
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-surface-secondary/50 backdrop-blur-sm border border-border-subtle hover:bg-surface-secondary transition-colors">
            <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="font-roboto font-semibold text-text-primary mb-2">Complete Pipeline</h3>
            <p className="font-roboto text-sm text-text-secondary leading-relaxed">
              From initial sketch to runway video - see your designs come to life in minutes
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-surface-secondary/50 backdrop-blur-sm border border-border-subtle hover:bg-surface-secondary transition-colors">
            <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-text-muted" />
            </div>
            <h3 className="font-roboto font-semibold text-text-primary mb-2">Professional Quality</h3>
            <p className="font-roboto text-sm text-text-secondary leading-relaxed">
              Studio-quality results that look hand-drawn by professional fashion designers
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="font-roboto text-sm text-text-muted">
            Powered by cutting-edge AI models from Google and Replicate
          </p>
        </div>
      </div>
    </div>
  );
}
