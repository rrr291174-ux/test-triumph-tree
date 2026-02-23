import { ArrowLeft, BookOpen, TrendingUp, CreditCard, ClipboardList, Settings, LogOut, ChevronRight, Shield, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="font-heading font-bold text-xl text-foreground">Sign in to view profile</h1>
        <Link to="/auth" className="gradient-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm">Sign In</Link>
      </div>
    );
  }

  const menuItems = [
    { icon: BookOpen, label: "My Courses", desc: "View enrolled courses", badge: "3" },
    { icon: TrendingUp, label: "Performance", desc: "Check your scores & ranks", to: "/progress" },
    { icon: CreditCard, label: "Payments", desc: "Transaction history" },
    { icon: ClipboardList, label: "Assignments", desc: "Pending assignments", badge: "2" },
    { icon: Settings, label: "Settings", desc: "App preferences" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center text-2xl font-heading font-bold text-primary-foreground shadow-primary">
            {user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-primary-foreground">
              {user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-primary-foreground/70 text-sm">{user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 bg-primary-foreground/20 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                👑 Admin
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-heading font-bold text-xl text-primary">0</div>
            <div className="text-[10px] text-muted-foreground">Points</div>
          </div>
          <div>
            <div className="font-heading font-bold text-xl text-secondary">0</div>
            <div className="text-[10px] text-muted-foreground">Tests Done</div>
          </div>
          <div>
            <div className="font-heading font-bold text-xl text-accent">0%</div>
            <div className="text-[10px] text-muted-foreground">Avg Score</div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border-2 border-primary/30 hover:shadow-card-hover transition-all"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-primary">Admin Dashboard</div>
              <div className="text-[11px] text-muted-foreground">Manage exams, materials & classes</div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        )}

        {menuItems.map((item, i) => {
          const inner = (
            <div
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
          );
          return item.to ? <Link key={item.label} to={item.to}>{inner}</Link> : <div key={item.label}>{inner}</div>;
        })}

        <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors mt-4">
          <LogOut className="h-5 w-5 text-destructive" />
          <span className="font-semibold text-sm text-destructive">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
