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

  // Redirect to login if not authenticated
  if (!user) {
    return null;
  }

  const handleSectionSelect = (section: string) => {
    if (section === "analytics") {
      setSelectedSection("analytics");
      setAnalyticsSubSection("");
    } else {
      setSelectedSection(section);
      setAnalyticsSubSection("");
    }
    
    // Update URL without page reload
    const newUrl = section === 'home' ? '/' : `/?section=${section}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleAnalyticsSubSelect = (subSection: string) => {
    setSelectedSection("analytics");
    setAnalyticsSubSection(subSection);
    
    // Update URL for analytics subsection
    const newUrl = `/?section=analytics&filter=${subSection}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation 
        selectedSection={selectedSection}
        onSelect={handleSectionSelect}
        analyticsSubSection={analyticsSubSection}
        onAnalyticsSubSelect={handleAnalyticsSubSelect}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        <Sidebar 
          selected={selectedSection} 
          onSelect={handleSectionSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggler />
            </div>
          </div>

          {/* Main content area */}
          <section className="p-4 lg:p-6 min-h-screen">
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

// Loading fallback component
function DashboardLoading() {
  // Enforce light theme even during loading
  useLightTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function Home() {
  // Enforce light theme at the page level
  useLightTheme();
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
