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
    <div className="min-h-screen bg-transparent">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="font-dancing text-2xl font-bold text-white drop-shadow-lg">
                  🎨 Muse Sketch Studio
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/home" className="text-white font-medium drop-shadow-md">Home</a>
                <a href="/design" className="text-white/80 hover:text-white transition-colors drop-shadow-md">Design</a>
                <a href="/gallery" className="text-white/80 hover:text-white transition-colors drop-shadow-md">Gallery</a>
                <a href="/about" className="text-white/80 hover:text-white transition-colors drop-shadow-md">About</a>
              </div>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button asChild className="bg-white text-black hover:bg-white/90 shadow-lg">
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
                className="text-white hover:bg-white/10"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/20 backdrop-blur-md rounded-lg mt-2 border border-white/10">
                <a href="/home" className="text-white block px-3 py-2 text-base font-medium">Home</a>
                <a href="/design" className="text-white/80 hover:text-white block px-3 py-2 text-base font-medium">Design</a>
                <a href="/gallery" className="text-white/80 hover:text-white block px-3 py-2 text-base font-medium">Gallery</a>
                <a href="/about" className="text-white/80 hover:text-white block px-3 py-2 text-base font-medium">About</a>
                <div className="pt-2">
                  <Button asChild className="w-full bg-white text-black hover:bg-white/90">
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

      {/* Hero Section with Background Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.4)' }} // Darken video for better text contrast
          >
            <source src="/background video.mp4" type="video/mp4" />
            {/* Fallback gradient if video fails to load */}
          </video>
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50"></div>
        </div>

        {/* Content layered on top of video */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-dancing text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
              Transform Your Fashion Ideas Into Reality
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-10 font-roboto font-light tracking-wide drop-shadow-lg">
              AI-Powered Design Pipeline
            </p>
            <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Join 10,000+ designers creating amazing fashion with AI. From sketch to runway video in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" asChild className="text-xl px-10 py-8 font-semibold bg-white text-black hover:bg-white/90 shadow-2xl">
                <a href="/design">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Designing
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-xl px-10 py-8 font-semibold border-white text-white bg-black/20 hover:bg-white/10 hover:border-white shadow-xl backdrop-blur-sm">
                <a href="/gallery">
                  <Eye className="mr-3 h-6 w-6" />
                  View Gallery
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Fallback background if video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-tertiary -z-10"></div>
      </section>


      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/90 text-sm">
            Made with ❤️ by{' '}
            <a href="https://silin.ca" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">
              Silin
            </a>
            ,{' '}
            <a href="https://sethisarthak.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">
              Sarthak
            </a>
            ,{' '}
            <a href="https://github.com/shauraya-mohan" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">
              Shauraya
            </a>
            {' '}and{' '}
            <a href="https://github.com/meharpruthi" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">
              Mehar
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
