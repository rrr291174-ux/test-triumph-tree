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

  const hideNav =
    location.pathname.startsWith("/exam/") ||
    location.pathname.startsWith("/exam-result/") ||
    location.pathname === "/auth";

  if (hideNav) return null;

  return (
    <>
      {/* Top Header — dark cinematic */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "linear-gradient(90deg, #060818 0%, #0d1535 50%, #060818 100%)",
          borderBottom: "1px solid rgba(245,158,11,0.2)",
          boxShadow: "0 2px 20px rgba(245,158,11,0.08)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo + Title */}
          <Link to="/" className="flex items-center gap-2.5">
            {/* Flame icon wrapper */}
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #1d4ed8)",
                boxShadow: "0 0 12px rgba(29,78,216,0.5)",
              }}
            >
              <img src={logo} alt="DK Study Zone" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <div
                className="font-heading font-extrabold text-base leading-none tracking-wide"
                style={{
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "none",
                }}
              >
                DK STUDY ZONE
              </div>
              <div className="text-[9px] text-white/40 font-semibold tracking-widest uppercase mt-0.5">
                AP & TG Competitive Exams
              </div>
            </div>
          </Link>

          {/* Profile icon */}
          <Link
            to="/profile"
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              boxShadow: "0 0 8px rgba(245,158,11,0.15)",
            }}
          >
            <User className="h-4 w-4" style={{ color: "#f59e0b" }} />
          </Link>
        </div>

        {/* Subtle golden bottom line glow */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 30%, rgba(59,130,246,0.6) 70%, transparent 100%)",
          }}
        />
      </header>

      {/* Bottom Navigation — dark themed */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "linear-gradient(0deg, #060818 0%, #0d1535 100%)",
          borderTop: "1px solid rgba(245,158,11,0.15)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 px-3 py-1 relative"
              >
                {isActive && (
                  <div
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}
                  />
                )}
                <item.icon
                  className="h-5 w-5"
                  style={{
                    color: isActive ? "#f59e0b" : "rgba(255,255,255,0.35)",
                    filter: isActive ? "drop-shadow(0 0 6px rgba(245,158,11,0.7))" : "none",
                    strokeWidth: isActive ? 2.5 : 1.8,
                  }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isActive ? "#f59e0b" : "rgba(255,255,255,0.35)" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
