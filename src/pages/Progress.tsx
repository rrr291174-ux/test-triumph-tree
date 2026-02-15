import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const weeklyData = [
  { week: "W1", score: 45, tests: 3 },
  { week: "W2", score: 52, tests: 4 },
  { week: "W3", score: 58, tests: 5 },
  { week: "W4", score: 65, tests: 4 },
  { week: "W5", score: 72, tests: 6 },
  { week: "W6", score: 68, tests: 3 },
  { week: "W7", score: 78, tests: 5 },
  { week: "W8", score: 85, tests: 7 },
];

const subjectScores = [
  { subject: "Psy", score: 82 },
  { subject: "Tel", score: 75 },
  { subject: "Eng", score: 88 },
  { subject: "Math", score: 70 },
  { subject: "Sci", score: 78 },
  { subject: "Soc", score: 85 },
];

export default function Progress() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero px-4 pt-4 pb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-3">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-primary-foreground">📈 Your Progress</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Track your improvement</p>
      </div>

      {/* Points Card */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 text-center">
          <div className="font-heading font-extrabold text-4xl text-primary">156</div>
          <div className="text-sm text-muted-foreground mt-1">Total Points Earned</div>
          <div className="flex justify-center gap-4 mt-3">
            <div className="gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">🔥 7 Day Streak</div>
            <div className="gradient-success text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">⬆ +12% this week</div>
          </div>
        </div>
      </div>

      {/* Score Trend */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject-wise */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subjectScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
