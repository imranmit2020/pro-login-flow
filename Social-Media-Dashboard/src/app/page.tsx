"use client";

// OfinaPulse Dashboard - Centralized Communication Management

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLightTheme } from "@/hooks/useLightTheme";
import { ThemeToggler } from "../components/ThemeToggler";
import { Sidebar } from "../components/Sidebar";
import { TopNavigation } from "../components/TopNavigation";
import { DashboardHome } from "../components/DashboardHome";

// Separate component that uses useSearchParams
function DashboardContent() {
  const [selectedSection, setSelectedSection] = useState("home");
  const [analyticsSubSection, setAnalyticsSubSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Enforce light theme throughout the dashboard
  useLightTheme();

  // Handle URL parameters for navigation
  useEffect(() => {
    const section = searchParams.get('section');
    const filter = searchParams.get('filter');
    
    if (section) {
      // Map URL section names to internal section names
      const sectionMap: Record<string, string> = {
        'unified-messages': 'messages',
        'messages': 'messages',
        'tasks': 'tasks',
        'analytics': 'analytics',
        'settings': 'settings',
        'calls': 'calls',
        'calendar': 'calendar',
        'emails': 'emails',
        'social': 'social',
        'campaigns': 'schedule',
        'ai-assistant': 'ai-assistant',
        'home': 'home'
      };
      
      const mappedSection = sectionMap[section] || section;
      setSelectedSection(mappedSection);
      
      // Handle analytics subsections
      if (section === 'analytics' && filter) {
        setAnalyticsSubSection(filter);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!user) {
    return null;
  }

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    setSidebarOpen(false);
  };

  const handleAnalyticsSubSelect = (subSection: string) => {
    setAnalyticsSubSection(subSection);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        selected={selectedSection}
        onSelect={handleSectionSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <TopNavigation
          selectedSection={selectedSection}
          onSelect={handleSectionSelect}
          analyticsSubSection={analyticsSubSection}
          onAnalyticsSubSelect={handleAnalyticsSubSelect}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Mobile Title */}
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                OfinaPulse
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggler />
            </div>
          </div>

          {/* Main content area */}
          <section className="p-4 lg:p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <DashboardHome 
              section={selectedSection} 
              analyticsSubSection={analyticsSubSection}
              onAnalyticsSubSelect={handleAnalyticsSubSelect}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}