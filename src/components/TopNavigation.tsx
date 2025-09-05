"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  User, 
  Menu,
  MessageSquare,
  Phone,
  Calendar
} from "lucide-react";

interface TopNavigationProps {
  selectedSection: string;
  onSelect: (section: string) => void;
  analyticsSubSection?: string;
  onAnalyticsSubSelect?: (subSection: string) => void;
  onToggleSidebar?: () => void;
}

export function TopNavigation({ 
  selectedSection,
  onSelect,
  analyticsSubSection,
  onAnalyticsSubSelect,
  onToggleSidebar 
}: TopNavigationProps) {
  const quickStats = [
    { label: "Messages", value: "12", icon: MessageSquare, color: "bg-blue-100 text-blue-800" },
    { label: "Active Calls", value: "3", icon: Phone, color: "bg-green-100 text-green-800" },
    { label: "Today's Meetings", value: "5", icon: Calendar, color: "bg-purple-100 text-purple-800" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <span className="font-medium">{stat.value}</span>
                  <span className="text-gray-500 ml-1">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages, calls, tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Profile */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Analytics Subsection Navigation */}
      {selectedSection === "analytics" && (
        <div className="border-t border-gray-200 px-4 lg:px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {["overview", "messages", "calls", "engagement"].map((sub) => (
              <Button
                key={sub}
                variant={analyticsSubSection === sub ? "default" : "ghost"}
                size="sm"
                onClick={() => onAnalyticsSubSelect?.(sub)}
              >
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}