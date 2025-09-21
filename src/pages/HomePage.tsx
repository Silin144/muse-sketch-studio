import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Palette, 
  User, 
  Video, 
  Smartphone, 
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  Heart,
  Eye,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock data for gallery
  const mockDesigns = [
    {
      id: '1',
      title: 'Elegant Evening Gown',
      thumbnail: 'https://via.placeholder.com/300x400/8B5CF6/FFFFFF?text=Elegant+Gown',
      designer: 'AI Designer',
      createdAt: new Date(),
      likes: 42
    },
    {
      id: '2',
      title: 'Modern Streetwear',
      thumbnail: 'https://via.placeholder.com/300x400/10B981/FFFFFF?text=Streetwear',
      designer: 'AI Designer',
      createdAt: new Date(),
      likes: 38
    },
    {
      id: '3',
      title: 'Classic Blazer',
      thumbnail: 'https://via.placeholder.com/300x400/F59E0B/FFFFFF?text=Blazer',
      designer: 'AI Designer',
      createdAt: new Date(),
      likes: 55
    },
    {
      id: '4',
      title: 'Bohemian Dress',
      thumbnail: 'https://via.placeholder.com/300x400/EF4444/FFFFFF?text=Bohemian',
      designer: 'AI Designer',
      createdAt: new Date(),
      likes: 29
    },
    {
      id: '5',
      title: 'Minimalist Shirt',
      thumbnail: 'https://via.placeholder.com/300x400/6366F1/FFFFFF?text=Minimalist',
      designer: 'AI Designer',
      createdAt: new Date(),
      likes: 33
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI Sketch Generation',
      description: 'Transform your ideas into professional fashion sketches with advanced AI',
      link: '/design',
      color: 'blue'
    },
    {
      icon: Palette,
      title: 'Color Customization',
      description: 'Add colors and textures to bring your designs to life',
      link: '/design',
      color: 'green'
    },
    {
      icon: User,
      title: 'Model Photography',
      description: 'See your designs on professional models with realistic photography',
      link: '/design',
      color: 'purple'
    },
    {
      icon: Video,
      title: 'Runway Videos',
      description: 'Create stunning runway show videos of your designs',
      link: '/design',
      color: 'red'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Design on any device with our responsive interface',
      link: null,
      color: 'orange'
    },
    {
      icon: TrendingUp,
      title: 'Global Trends',
      description: 'Stay updated with the latest fashion trends and insights',
      link: null,
      color: 'pink'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-surface-primary/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="font-dancing text-2xl font-bold text-text-primary">
                  🎨 Muse Sketch Studio
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/home" className="text-text-primary font-medium">Home</a>
                <a href="/design" className="text-text-secondary hover:text-text-primary transition-colors">Design</a>
                <a href="/gallery" className="text-text-secondary hover:text-text-primary transition-colors">Gallery</a>
                <a href="/about" className="text-text-secondary hover:text-text-primary transition-colors">About</a>
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button asChild>
                <a href="/design">
                  Start Designing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface-secondary rounded-lg mt-2">
                <a href="/home" className="text-text-primary block px-3 py-2 text-base font-medium">Home</a>
                <a href="/design" className="text-text-secondary hover:text-text-primary block px-3 py-2 text-base font-medium">Design</a>
                <a href="/gallery" className="text-text-secondary hover:text-text-primary block px-3 py-2 text-base font-medium">Gallery</a>
                <a href="/about" className="text-text-secondary hover:text-text-primary block px-3 py-2 text-base font-medium">About</a>
                <div className="pt-2">
                  <Button asChild className="w-full">
                    <a href="/design">
                      Start Designing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-dancing text-6xl md:text-8xl lg:text-9xl font-bold text-text-primary mb-8 leading-tight tracking-tight">
              Transform Your Fashion Ideas Into Reality
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-text-secondary mb-10 font-roboto font-light tracking-wide">
              AI-Powered Design Pipeline
            </p>
            <p className="text-xl md:text-2xl text-text-muted mb-16 max-w-3xl mx-auto leading-relaxed">
              Join 10,000+ designers creating amazing fashion with AI. From sketch to runway video in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" asChild className="text-xl px-10 py-8 font-semibold">
                <a href="/design">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Designing
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-xl px-10 py-8 font-semibold">
                <a href="/gallery">
                  <Eye className="mr-3 h-6 w-6" />
                  View Gallery
                </a>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-xl px-10 py-8 font-semibold">
                <a href="/about">
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-surface-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-dancing text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              Powerful Features
            </h2>
            <p className="text-2xl md:text-3xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light">
              Everything you need to create professional fashion designs with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "group p-8 rounded-2xl bg-surface-secondary border border-border-subtle hover:border-border-default transition-all duration-300 hover:shadow-default cursor-pointer",
                    feature.link && "hover:scale-105"
                  )}
                  onClick={() => feature.link && (window.location.href = feature.link)}
                >
                  <div className="flex items-center mb-6">
                    <div className={cn(
                      "p-4 rounded-xl mr-6",
                      feature.color === 'blue' && "bg-blue-100 text-blue-600",
                      feature.color === 'green' && "bg-green-100 text-green-600",
                      feature.color === 'purple' && "bg-purple-100 text-purple-600",
                      feature.color === 'red' && "bg-red-100 text-red-600",
                      feature.color === 'orange' && "bg-orange-100 text-orange-600",
                      feature.color === 'pink' && "bg-pink-100 text-pink-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.link && (
                    <div className="mt-6 flex items-center text-text-primary font-medium group-hover:text-primary transition-colors">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="py-32 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-dancing text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight tracking-tight">
              Recent Designs
            </h2>
            <p className="text-2xl md:text-3xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light">
              See what our community is creating with AI-powered fashion design
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            {mockDesigns.map((design) => (
              <div
                key={design.id}
                className="group bg-surface-primary rounded-xl overflow-hidden border border-border-subtle hover:border-border-default transition-all duration-300 hover:shadow-default hover:scale-105 cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={design.thumbnail}
                    alt={design.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary mb-1 truncate">
                    {design.title}
                  </h3>
                  <p className="text-sm text-text-secondary mb-2">
                    by {design.designer}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-text-muted">
                      <Heart className="h-4 w-4 mr-1" />
                      <span className="text-sm">{design.likes}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild className="text-xl px-10 py-8 font-semibold">
              <a href="/gallery">
                View All Designs
                <ArrowRight className="ml-3 h-6 w-6" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-tertiary border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-dancing text-2xl font-bold text-text-primary mb-4">
                🎨 Muse Sketch Studio
              </h3>
              <p className="text-text-secondary mb-4 max-w-md">
                Transform your fashion ideas into reality with our AI-powered design pipeline. 
                From sketch to runway video in minutes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/home" className="text-text-secondary hover:text-text-primary transition-colors">Home</a></li>
                <li><a href="/design" className="text-text-secondary hover:text-text-primary transition-colors">Design</a></li>
                <li><a href="/gallery" className="text-text-secondary hover:text-text-primary transition-colors">Gallery</a></li>
                <li><a href="/about" className="text-text-secondary hover:text-text-primary transition-colors">About</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-text-primary mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-text-secondary hover:text-text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border-subtle mt-8 pt-8 text-center">
            <p className="text-text-muted">
              © 2024 Muse Sketch Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
