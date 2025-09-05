"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { DashboardHome } from "@/components/DashboardHome";

// Separate component that uses useSearchParams
function DashboardContent() {
  const [selectedSection, setSelectedSection] = useState("home");
  const [analyticsSubSection, setAnalyticsSubSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();

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
        'social-pages': 'social-pages',
        'social-management': 'social-management',
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
    <div className="min-h-screen bg-gray-50">
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
          <DashboardHome 
            section={selectedSection} 
            analyticsSubSection={analyticsSubSection}
            onAnalyticsSubSelect={handleAnalyticsSubSelect}
          />
        </main>
      </div>
    </div>
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}