"use client";

import { DashboardSection } from "./sections/DashboardSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { SettingsSection } from "./sections/SettingsSection";
import { UnifiedMessagesSection } from "./sections/UnifiedMessagesSection";
import { SocialPagesSection } from "./sections/SocialPagesSection";
import { TasksSection } from "./sections/TasksSection";
import { EmailSection } from "./sections/EmailSection";
import { CampaignsSection } from "./sections/CampaignsSection";
import { SocialMediaSection } from "./sections/SocialMediaSection";
import React from "react";
import { CallsSection } from "./sections/CallsSection";
import { CalendarSection } from "./sections/CalendarSection";
import { AIAssistantSection } from "./sections/AIAssistantSection";
import { useLightTheme } from "@/hooks/useLightTheme";

export function DashboardHome({ 
  section, 
  analyticsSubSection,
  onAnalyticsSubSelect
}: { 
  section: string;
  analyticsSubSection?: string;
  onAnalyticsSubSelect?: (subSection: string) => void;
}) {
  // Enforce light theme in dashboard home
  useLightTheme();
  switch (section) {
    case "home":
      return <DashboardSection />;
    case "tasks":
      return <TasksSection />;
    case "emails":
      return <EmailSection />;
    case "schedule":
      return <CampaignsSection />;
    case "social":
      return <SocialMediaSection />;
    case "calls":
      return <CallsSection />;
    case "calendar":
      return <CalendarSection />;
    case "messages":
      return <UnifiedMessagesSection />;
    case "analytics":
      return <AnalyticsSection subSection={analyticsSubSection} onAnalyticsSubSelect={onAnalyticsSubSelect} />;
    case "settings":
      return <SettingsSection />;
    case "social-pages":
      return <SocialPagesSection />;
    case "social-management":
      const SocialMediaManagementLazy = React.lazy(() => 
        import("./sections/SocialMediaManagementSection").then(module => ({
          default: module.SocialMediaManagementSection
        }))
      );
      return (
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
          </div>
        }>
          <SocialMediaManagementLazy />
        </React.Suspense>
      );
    case "ai-assistant":
      return <AIAssistantSection />;
    default:
      return <DashboardSection />;
  }
}
