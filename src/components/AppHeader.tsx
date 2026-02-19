import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageCircle, TrendingUp } from "lucide-react";
import logo from "@/assets/dk-logo.png";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppHeader() {
  const location = useLocation();

  // Hide header/nav on exam taking page and auth page — full screen mode
  const hideNav = location.pathname.startsWith("/exam/") || location.pathname.startsWith("/exam-result/") || location.pathname === "/auth";

  if (hideNav) return null;

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 gradient-hero shadow-primary">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="DK Study Zone" className="h-13 w-13 rounded-xl" />
            <span className="font-heading font-bold text-2xl text-primary-foreground tracking-tight">
              DK STUDY ZONE
            </span>
          </Link>
          <Link
            to="/profile"
            className="h-9 w-9 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <User className="h-5 w-5 text-primary-foreground" />
          </Link>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-card">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
