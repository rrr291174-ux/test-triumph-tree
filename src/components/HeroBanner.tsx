import heroBanner from "@/assets/hero-banner.jpg";

export function HeroBanner() {
  return (
    <div className="relative mx-4 mt-4 mb-2 rounded-2xl overflow-hidden shadow-card">
      <img
        src={heroBanner}
        alt="DK Study Hub - Prepare for your exams"
        className="w-full h-40 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center">
        <div className="px-5">
          <h1 className="font-heading font-extrabold text-xl text-primary-foreground leading-tight">
            Ace Your<br />Exams! 🎯
          </h1>
          <p className="text-primary-foreground/80 text-xs mt-1 max-w-[180px]">
            Complete study material for AP & TS competitive exams
          </p>
        </div>
      </div>
    </div>
  );
}
