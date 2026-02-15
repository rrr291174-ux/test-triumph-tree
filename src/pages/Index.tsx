import { useState } from "react";
import { StateSelector } from "@/components/StateSelector";
import { SubjectGrid } from "@/components/SubjectGrid";
import { HeroBanner } from "@/components/HeroBanner";

const Index = () => {
  const [selectedState, setSelectedState] = useState<string | null>("ap");

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeroBanner />
      <StateSelector selected={selectedState} onSelect={setSelectedState} />
      
      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-primary">50+</div>
            <div className="text-[10px] text-muted-foreground">Test Series</div>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-secondary">200+</div>
            <div className="text-[10px] text-muted-foreground">Notes</div>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card border border-border/50 text-center">
            <div className="font-heading font-bold text-lg text-accent">100+</div>
            <div className="text-[10px] text-muted-foreground">Classes</div>
          </div>
        </div>
      </div>

      <SubjectGrid />
    </div>
  );
};

export default Index;
