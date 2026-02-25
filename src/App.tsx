import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

import Home          from "./pages/Home";
import About         from "./pages/About";
import Projects      from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact       from "./pages/Contact";
import Login         from "./pages/Login";
import Hub           from "./pages/Hub";
import AuthCallback  from "./pages/AuthCallback";
import NotFound      from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ── Public marketing ── */}
            <Route path="/"                  element={<Home />} />
            <Route path="/about"             element={<About />} />
            <Route path="/projects"          element={<Projects />} />
            <Route path="/projects/:slug"    element={<ProjectDetail />} />
            <Route path="/contact"           element={<Contact />} />
            <Route path="/login"             element={<Login />} />
            <Route path="/auth/callback"    element={<AuthCallback />} />

            {/* ── Private hub ── */}
            <Route path="/hub" element={
              <ProtectedRoute>
                <Hub />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
