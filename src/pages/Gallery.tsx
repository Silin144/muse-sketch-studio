import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Palette, User } from "lucide-react";

interface GalleryItem {
  id: number;
  name: string;
  category: string;
  sketch: string;
  colored: string;
  model: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    name: "Elegant Evening Dress",
    category: "Formal Wear",
    sketch: "/image-1.jpeg",
    colored: "/image-2.jpeg",
    model: "/image-3.jpeg"
  },
  {
    id: 2,
    name: "Avant Garde Jacket with Angular Cuts",
    category: "Avant Garde",
    sketch: "/image-4.jpeg",
    colored: "/image-5.jpeg",
    model: "/image-6.jpeg"
  },
  {
    id: 3,
    name: "Halloween Jacket",
    category: "Seasonal Wear",
    sketch: "/image-7.jpeg",
    colored: "/image-8.jpeg",
    model: "/image-9.jpeg"
  }
];

const steps = [
  {
    icon: Sparkles,
    title: "AI Sketch",
    description: "Generated from text prompt",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Palette,
    title: "Color Design",
    description: "AI-powered coloring",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: User,
    title: "Model Photo",
    description: "Realistic visualization",
    color: "from-purple-500 to-pink-500"
  }
];

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <header className="bg-surface-primary border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="/home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </Button>
              <div>
                <h1 className="font-dancing text-3xl font-bold text-text-primary">
                  Design Gallery
                </h1>
                <p className="text-text-secondary">
                  See how AI transforms ideas into fashion
                </p>
              </div>
            </div>
            <Button asChild>
              <a href="/design">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Process Overview */}
      <section className="py-12 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-dancing text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Our Design Process
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              From concept to creation in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 bg-surface-primary rounded-2xl border border-border-subtle"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {galleryItems.map((item, itemIndex) => (
              <div key={item.id} className="space-y-8">
                {/* Item Header */}
                <div className="text-center">
                  <Badge variant="secondary" className="mb-3">
                    {item.category}
                  </Badge>
                  <h3 className="font-dancing text-3xl md:text-4xl font-bold text-text-primary">
                    {item.name}
                  </h3>
                </div>

                {/* Process Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Sketch */}
                  <div className="group cursor-pointer" onClick={() => setSelectedItem(selectedItem === itemIndex * 3 ? null : itemIndex * 3)}>
                    <div className="relative overflow-hidden rounded-2xl bg-surface-secondary border border-border-subtle hover:border-border-default transition-all duration-300 hover:shadow-default">
                      <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                        <img
                          src={item.sketch}
                          alt={`${item.name} - Sketch`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-center p-8">
                          <Sparkles className="h-12 w-12 text-blue-500 mb-4" />
                          <p className="text-text-secondary font-medium">Sketch Placeholder</p>
                          <p className="text-text-muted text-sm mt-2">image-{itemIndex * 3 + 1}.jpeg</p>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary">AI Sketch</h4>
                        </div>
                        <p className="text-text-secondary text-sm">
                          Generated from creative prompt and design requirements
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Colored */}
                  <div className="group cursor-pointer" onClick={() => setSelectedItem(selectedItem === itemIndex * 3 + 1 ? null : itemIndex * 3 + 1)}>
                    <div className="relative overflow-hidden rounded-2xl bg-surface-secondary border border-border-subtle hover:border-border-default transition-all duration-300 hover:shadow-default">
                      <div className="aspect-[3/4] bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                        <img
                          src={item.colored}
                          alt={`${item.name} - Colored`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-center p-8">
                          <Palette className="h-12 w-12 text-green-500 mb-4" />
                          <p className="text-text-secondary font-medium">Colored Design</p>
                          <p className="text-text-muted text-sm mt-2">image-{itemIndex * 3 + 2}.jpeg</p>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <Palette className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary">Color Design</h4>
                        </div>
                        <p className="text-text-secondary text-sm">
                          AI-powered coloring with custom palette selection
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Model */}
                  <div className="group cursor-pointer" onClick={() => setSelectedItem(selectedItem === itemIndex * 3 + 2 ? null : itemIndex * 3 + 2)}>
                    <div className="relative overflow-hidden rounded-2xl bg-surface-secondary border border-border-subtle hover:border-border-default transition-all duration-300 hover:shadow-default">
                      <div className="aspect-[3/4] bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                        <img
                          src={item.model}
                          alt={`${item.name} - Model`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex-col items-center justify-center text-center p-8">
                          <User className="h-12 w-12 text-purple-500 mb-4" />
                          <p className="text-text-secondary font-medium">Model Photo</p>
                          <p className="text-text-muted text-sm mt-2">image-{itemIndex * 3 + 3}.jpeg</p>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-lg font-semibold text-text-primary">Model Photo</h4>
                        </div>
                        <p className="text-text-secondary text-sm">
                          Realistic visualization on professional models
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {itemIndex < galleryItems.length - 1 && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-px bg-border-subtle flex-1 max-w-xs"></div>
                    <div className="px-4">
                      <div className="w-2 h-2 bg-border-default rounded-full"></div>
                    </div>
                    <div className="h-px bg-border-subtle flex-1 max-w-xs"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-surface-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-dancing text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Ready to Create Your Own?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of designers using AI to bring their fashion ideas to life
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <a href="/design">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Designing Now
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-primary py-6 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-text-secondary">
            Made with ❤️ by{' '}
            <a href="https://silin.ca" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:underline">
              Silin
            </a>
            ,{' '}
            <a href="https://sethisarthak.com" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:underline">
              Sarthak
            </a>
            ,{' '}
            <a href="https://github.com/shauraya-mohan" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:underline">
              Shauraya
            </a>
            {' '}and{' '}
            <a href="https://github.com/meharpruthi" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:underline">
              Mehar
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
