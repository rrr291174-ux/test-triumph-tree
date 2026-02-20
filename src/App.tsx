import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { AppHeader } from "@/components/AppHeader";
import Index from "./pages/Index";
import SubjectDetail from "./pages/SubjectDetail";
import SubjectsPage from "./pages/SubjectsPage";
import ExamList from "./pages/ExamList";
import ExamTake from "./pages/ExamTake";
import ExamResult from "./pages/ExamResult";
import AdminUpload from "./pages/AdminUpload";
import AdminExams from "./pages/AdminExams";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/subjects/:examType" element={<SubjectsPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subject/:subjectId" element={<SubjectDetail />} />
              <Route path="/exams/:subjectSlug" element={<ExamList />} />
              <Route path="/exam/:examId" element={<ExamTake />} />
              <Route path="/exam-result/:attemptId" element={<ExamResult />} />
              <Route path="/admin/upload" element={<AdminUpload />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

