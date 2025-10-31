import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Trash2, Heart, HeartOff, Sparkles, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface SavedDesign {
  id: string;
  name: string;
  category: string;
  garmentType: string;
  gender: string;
  prompt: string;
  sketchUrl: string | null;
  coloredUrl: string | null;
  modelUrl: string | null;
  runwayUrl: string | null;
  angleViews?: Array<{ angle: string; imageUrl: string }>;
  colors: string[];
  favorite: boolean;
  createdAt: string;
}

export default function Portfolio() {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [filteredDesigns, setFilteredDesigns] = useState<SavedDesign[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [favoriteFilter, setFavoriteFilter] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load designs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fashion-portfolio');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDesigns(parsed);
        setFilteredDesigns(parsed);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      }
    }
  }, []);

  // Filter designs
  useEffect(() => {
    let filtered = [...designs];
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }
    
    if (favoriteFilter) {
      filtered = filtered.filter(d => d.favorite);
    }
    
    setFilteredDesigns(filtered);
  }, [designs, categoryFilter, favoriteFilter]);

  // Get unique categories
  const categories = Array.from(new Set(designs.map(d => d.category))).filter(Boolean);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    const updated = designs.map(d => 
      d.id === id ? { ...d, favorite: !d.favorite } : d
    );
    setDesigns(updated);
    localStorage.setItem('fashion-portfolio', JSON.stringify(updated));
    toast({ title: "Updated favorites" });
  };

  // Delete design
  const deleteDesign = (id: string) => {
    const updated = designs.filter(d => d.id !== id);
    setDesigns(updated);
    localStorage.setItem('fashion-portfolio', JSON.stringify(updated));
    toast({ title: "Design deleted", variant: "destructive" });
  };

  // Download image
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast({ title: "Downloaded successfully!" });
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Header */}
      <header className="bg-surface-primary border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/home')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="font-dancing text-3xl font-bold text-text-primary">
                  My Portfolio
                </h1>
                <p className="text-text-secondary text-sm">
                  {designs.length} {designs.length === 1 ? 'design' : 'designs'} saved
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/design')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create New Design
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-surface-secondary py-6 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">Filters:</span>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant={favoriteFilter ? "default" : "outline"} 
              size="sm"
              onClick={() => setFavoriteFilter(!favoriteFilter)}
            >
              {favoriteFilter ? <Heart className="h-4 w-4 mr-2 fill-current" /> : <HeartOff className="h-4 w-4 mr-2" />}
              Favorites Only
            </Button>

            {(categoryFilter !== "all" || favoriteFilter) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setFavoriteFilter(false);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDesigns.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-16 w-16 text-text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {designs.length === 0 ? "No designs yet" : "No designs match your filters"}
              </h2>
              <p className="text-text-secondary mb-6">
                {designs.length === 0 
                  ? "Start creating your first design to build your portfolio" 
                  : "Try adjusting your filters to see more designs"}
              </p>
              <Button onClick={() => navigate('/design')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Design
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <Card key={design.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="aspect-[3/4] bg-surface-secondary relative">
                    <img 
                      src={design.modelUrl || design.coloredUrl || design.sketchUrl || ''} 
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-surface-primary/90 hover:bg-surface-primary"
                      onClick={() => toggleFavorite(design.id)}
                    >
                      {design.favorite ? (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-text-primary truncate">
                        {design.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {design.garmentType} · {design.gender}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {design.category}
                      </Badge>
                      {design.colors.length > 0 && (
                        <div className="flex gap-1">
                          {design.colors.slice(0, 3).map((color, idx) => (
                            <div 
                              key={idx}
                              className="w-4 h-4 rounded-full border border-border-subtle"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2">
                      {design.prompt}
                    </p>

                    <div className="text-xs text-text-muted">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => downloadImage(
                          design.modelUrl || design.coloredUrl || design.sketchUrl || '', 
                          `${design.name}.jpg`
                        )}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteDesign(design.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Helper function to save designs (export for use in other components)
export const saveToPortfolio = (design: Omit<SavedDesign, 'id' | 'favorite' | 'createdAt'>) => {
  const saved = localStorage.getItem('fashion-portfolio');
  const existing = saved ? JSON.parse(saved) : [];
  
  const newDesign: SavedDesign = {
    ...design,
    id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    favorite: false,
    createdAt: new Date().toISOString()
  };
  
  const updated = [newDesign, ...existing];
  localStorage.setItem('fashion-portfolio', JSON.stringify(updated));
  
  return newDesign;
};

