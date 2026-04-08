import { Link, useLocation } from "react-router-dom";
import { Home, User, MessageCircle, Clapperboard, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import logo from "@/assets/dk-logo.png";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shorts", icon: Clapperboard, label: "Shorts" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function AppHeader() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const hideNav =
    location.pathname.startsWith("/exam/") ||
    location.pathname.startsWith("/exam-result/") ||
    location.pathname === "/auth";

  if (hideNav) return null;

  return (
    <>
      {/* Top Header */}
      <header
        className="sticky top-0 z-50 transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(90deg, #060818 0%, #0d1535 50%, #060818 100%)"
            : "linear-gradient(90deg, #ffffff 0%, #f8faff 50%, #ffffff 100%)",
          borderBottom: isDark
            ? "1px solid rgba(245,158,11,0.2)"
            : "1px solid rgba(245,158,11,0.25)",
          boxShadow: isDark
            ? "0 2px 20px rgba(245,158,11,0.08)"
            : "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo + Title */}
          <Link to="/" className="flex items-center gap-2.5">
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
                }}
              >
                DK STUDY ZONE
              </div>
              <div
                className="text-[9px] font-semibold tracking-widest uppercase mt-0.5"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
              >
                AP & TG Competitive Exams
              </div>
            </div>
          </Link>

          {/* Right side: Theme toggle + Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: isDark ? "rgba(255,200,50,0.1)" : "rgba(30,58,138,0.08)",
                border: isDark ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(30,58,138,0.2)",
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" style={{ color: "#f59e0b" }} />
              ) : (
                <Moon className="h-4 w-4" style={{ color: "#1d4ed8" }} />
              )}
            </button>

            {/* Profile icon */}
            <Link
              to="/profile"
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{
                background: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)",
                border: isDark ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(245,158,11,0.3)",
                boxShadow: "0 0 8px rgba(245,158,11,0.15)",
              }}
            >
              <User className="h-4 w-4" style={{ color: "#f59e0b" }} />
            </Link>
          </div>
        </div>

        {/* Bottom line glow */}
        <div
          className="h-px w-full"
          style={{
            background: isDark
              ? "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 30%, rgba(59,130,246,0.6) 70%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 30%, rgba(59,130,246,0.4) 70%, transparent 100%)",
          }}
        />
      </header>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(0deg, #060818 0%, #0d1535 100%)"
            : "linear-gradient(0deg, #ffffff 0%, #f8faff 100%)",
          borderTop: isDark
            ? "1px solid rgba(245,158,11,0.15)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark
            ? "0 -4px 20px rgba(0,0,0,0.5)"
            : "0 -4px 16px rgba(0,0,0,0.06)",
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
                    color: isActive ? "#f59e0b" : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                    filter: isActive ? "drop-shadow(0 0 6px rgba(245,158,11,0.7))" : "none",
                    strokeWidth: isActive ? 2.5 : 1.8,
                  }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isActive ? "#f59e0b" : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)" }}
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
