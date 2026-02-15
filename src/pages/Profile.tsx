import { ArrowLeft, BookOpen, TrendingUp, CreditCard, ClipboardList, Settings, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { icon: BookOpen, label: "My Courses", desc: "View enrolled courses", badge: "3" },
  { icon: TrendingUp, label: "Performance", desc: "Check your scores & ranks" },
  { icon: CreditCard, label: "Payments", desc: "Transaction history" },
  { icon: ClipboardList, label: "Assignments", desc: "Pending assignments", badge: "2" },
  { icon: Settings, label: "Settings", desc: "App preferences" },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero px-4 pt-4 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center text-2xl font-heading font-bold text-primary-foreground shadow-primary">
            DK
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-primary-foreground">Student User</h1>
            <p className="text-primary-foreground/70 text-sm">student@dkstudyhub.com</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-heading font-bold text-xl text-primary">156</div>
            <div className="text-[10px] text-muted-foreground">Points</div>
          </div>
          <div>
            <div className="font-heading font-bold text-xl text-secondary">12</div>
            <div className="text-[10px] text-muted-foreground">Tests Done</div>
          </div>
          <div>
            <div className="font-heading font-bold text-xl text-accent">85%</div>
            <div className="text-[10px] text-muted-foreground">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4 space-y-2">
        {menuItems.map((item, i) => (
          <div
            key={item.label}
            className="animate-slide-up flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-foreground">{item.label}</div>
              <div className="text-[11px] text-muted-foreground">{item.desc}</div>
            </div>
            {item.badge && (
              <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}

        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors mt-4">
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="font-semibold text-sm text-destructive">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
