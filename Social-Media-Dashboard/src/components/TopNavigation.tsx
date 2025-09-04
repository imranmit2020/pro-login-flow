"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { useAppointments } from "@/hooks/useAppointments";
import { useLightTheme } from "@/hooks/useLightTheme";
import { 
  CheckSquare, 
  Mail, 
  Share2, 
  Phone, 
  CalendarDays,
  Home,
  BarChart3,
  Menu,
  User,
  LogOut,
  Settings
} from "lucide-react";

export function TopNavigation({ 
  selectedSection, 
  onSelect,
  analyticsSubSection,
  onAnalyticsSubSelect,
  onToggleSidebar
}: { 
  selectedSection: string;
  onSelect: (key: string) => void;
  analyticsSubSection?: string;
  onAnalyticsSubSelect?: (key: string) => void;
  onToggleSidebar?: () => void;
}) {
  // Enforce light theme in top navigation
  useLightTheme();
  
  const [showAnalyticsSubmenu, setShowAnalyticsSubmenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { transformedTasks } = useTasks();
  const { pendingAppointmentsCount } = useAppointments();

  // Calculate pending tasks count dynamically
  const pendingTasksCount = transformedTasks.filter(task => task.status === 'pending').length;

  const navigationItems = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      color: "text-blue-600 hover:text-blue-700",
      bgColor: "hover:bg-blue-50"
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      color: "text-green-600 hover:text-green-700",
      bgColor: "hover:bg-green-50",
      badge: pendingTasksCount > 0 ? pendingTasksCount.toString() : undefined
    },

    {
      key: "social",
      label: "Social",
      icon: Share2,
      color: "text-pink-600 hover:text-pink-700",
      bgColor: "hover:bg-pink-50"
    },
    {
      key: "calls",
      label: "Calls",
      icon: Phone,
      color: "text-red-600 hover:text-red-700",
      bgColor: "hover:bg-red-50",
      badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount.toString() : undefined
    },
    {
      key: "calendar",
      label: "Calendar",
      icon: CalendarDays,
      color: "text-teal-600 hover:text-teal-700",
      bgColor: "hover:bg-teal-50"
    }
  ];

  const handleItemClick = (key: string) => {
    if (key === "analytics") {
      setShowAnalyticsSubmenu(!showAnalyticsSubmenu);
    } else {
      // Map social navitem to messages section (unified messages)
      const sectionKey = key === "social" ? "messages" : key;
      onSelect(sectionKey);
      setShowAnalyticsSubmenu(false);
    }
  };

  const handleMobileItemClick = (key: string) => {
    if (key === "analytics") {
      setShowAnalyticsSubmenu(!showAnalyticsSubmenu);
    } else {
      // Map social navitem to messages section (unified messages)
      const sectionKey = key === "social" ? "messages" : key;
      onSelect(sectionKey);
      setShowAnalyticsSubmenu(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleAnalyticsSubClick = (key: string) => {
    if (onAnalyticsSubSelect) {
      onAnalyticsSubSelect(key);
    }
    setShowAnalyticsSubmenu(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-card border-b border-border shadow-sm">
      {/* Main Navigation */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand with Hamburger Menu */}
          <div className="flex items-center gap-3">
            {/* Desktop Hamburger Menu */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="hover:bg-accent w-9 h-9"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
             {/* Mobile Hamburger Menu */}
             <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:bg-accent w-9 h-9"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Navigation Items and User Profile */}
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              // Show social navitem as selected when messages section is active (since social opens messages)
              const isSelected = item.key === "social" ? selectedSection === "messages" : selectedSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item.key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isSelected 
                      ? `${item.color.split(' ')[0]} bg-blue-50 font-medium shadow-sm` 
                      : `text-gray-600 ${item.bgColor} hover:shadow-sm`
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
            
            {/* Analytics with Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleItemClick("analytics")}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${selectedSection === "analytics" 
                    ? "text-indigo-600 bg-indigo-50 font-medium shadow-sm" 
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm"
                  }
                `}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Analytics</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${showAnalyticsSubmenu ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Analytics Submenu */}
              {showAnalyticsSubmenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-w-[calc(100vw-1rem)] origin-top-right">
                  {navigationItems.slice(1).map((item) => (
                    <button
                      key={`analytics-${item.key}`}
                      onClick={() => handleAnalyticsSubClick(`analytics-${item.key}`)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors
                        ${analyticsSubSection === `analytics-${item.key}` ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label} Analytics</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User Profile Section */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {!isLoading && (
                  <svg 
                    className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSelect("settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
       {/* Mobile Navigation Menu */}
       {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="overflow-x-auto scrollbar-hide mobile-scroll mobile-nav-container">
            <nav className="flex px-4 pt-2 pb-4 gap-2 min-w-max">
              {navigationItems.map((item) => {
                // Show social navitem as selected when messages section is active (since social opens messages)
                const isSelected = item.key === "social" ? selectedSection === "messages" : selectedSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleMobileItemClick(item.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 mobile-nav-item
                      ${isSelected 
                        ? `${item.color.split(' ')[0]} bg-blue-50 font-medium shadow-sm` 
                        : `text-gray-600 ${item.bgColor} hover:shadow-sm`
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
              
              {/* Mobile Analytics with Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => handleMobileItemClick("analytics")}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap mobile-nav-item
                    ${selectedSection === "analytics" 
                      ? "text-indigo-600 bg-indigo-50 font-medium shadow-sm" 
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm"
                    }
                  `}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Analytics</span>
                  <svg 
                    className={`w-3 h-3 transition-transform ${showAnalyticsSubmenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Analytics Submenu */}
                {showAnalyticsSubmenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {navigationItems.slice(1).map((item) => (
                      <button
                        key={`analytics-${item.key}`}
                        onClick={() => handleAnalyticsSubClick(`analytics-${item.key}`)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors
                          ${analyticsSubSection === `analytics-${item.key}` ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                        `}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm">{item.label} Analytics</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          {/* Add scroll indicator for mobile */}
          <div className="px-4 pb-2">
            <div className="text-xs text-gray-400 text-center opacity-75">
              Scroll horizontally for more options
            </div>
          </div>
        </div>
      )}
    </div>
  );
}