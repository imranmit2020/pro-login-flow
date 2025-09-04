"use client";

import { Home, MessageCircle, Settings, X, BarChart3, Zap, Activity, Globe, ChevronLeft, ChevronRight, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLightTheme } from "@/hooks/useLightTheme";

const navItems = [
  { 
    key: "dashboard", 
    label: "Dashboard", 
    icon: Home,
    description: "Overview & insights"
  },
  { 
    key: "messages", 
    label: "All Messages", 
    icon: MessageCircle,
    description: "Unified inbox"
  },
  { 
    key: "social-pages", 
    label: "Social Pages", 
    icon: Globe,
    description: "Manage accounts"
  },
  { 
    key: "ai-assistant", 
    label: "AI Assistant", 
    icon: Brain,
    description: "Smart assistant"
  },
  { 
    key: "analytics", 
    label: "Analytics", 
    icon: BarChart3,
    description: "Performance data"
  },
  { 
    key: "settings", 
    label: "Settings", 
    icon: Settings,
    description: "Configuration"
  },
];

export function Sidebar({
  selected,
  onSelect,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: {
  selected: string;
  onSelect: (key: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  useLightTheme();
  
  const handleItemClick = (key: string) => {
    onSelect(key);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative lg:translate-x-0 min-h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-20" : "w-80"
      )}>
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
              {!isCollapsed ? (
                <div className="flex items-center gap-3">
                  <img 
                    src="/OfinaPulse-Logo.png" 
                    alt="OfinaPulse Logo" 
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                      OfinaPulse
                    </h2>
                    <p className="text-xs text-gray-600">Smart Dental Hub</p>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img 
                    src="/OfinaPulse-Logo.png" 
                    alt="OfinaPulse Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
              )}
            </div>
            
            {/* Desktop Toggle Button */}
            <div className="hidden lg:block">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleCollapse} 
                className="w-8 h-8"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Mobile Close Button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Status Indicator */}
          {!isCollapsed && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-700 font-semibold">Online</span>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          )}
          
          {/* Collapsed Status Indicator */}
          {isCollapsed && (
            <div className="mt-4 flex justify-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className={cn("flex-1 py-6 space-y-2", isCollapsed ? "px-2" : "px-4")}>
          {navItems.map((item, index) => {
            const isSelected = selected === item.key;
            return (
              <div key={item.key} className="relative">
                <button
                  className={cn(
                    "flex items-center w-full text-left rounded-xl transition-all duration-200",
                    "hover:bg-gray-50 hover:shadow-sm",
                    isSelected && "bg-blue-50 border border-blue-200 shadow-sm",
                    isCollapsed ? "px-3 py-3 justify-center" : "px-4 py-4"
                  )}
                  onClick={() => handleItemClick(item.key)}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex items-center justify-center rounded-lg",
                    "bg-gradient-to-br from-blue-500 to-teal-500 text-white",
                    isCollapsed ? "w-10 h-10" : "w-12 h-12 mr-4"
                  )}>
                    <item.icon className={cn(isCollapsed ? "w-4 h-4" : "w-5 h-5")} />
                  </div>
                  
                  {/* Content - Only show when not collapsed */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "font-semibold text-sm block",
                        isSelected ? "text-blue-900" : "text-gray-700"
                      )}>
                        {item.label}
                      </span>
                      <p className={cn(
                        "text-xs mt-1",
                        isSelected ? "text-blue-700" : "text-gray-500"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className={cn("p-4 border-t border-gray-200", isCollapsed && "p-2")}>
          <div className={cn("text-center space-y-2", isCollapsed && "space-y-1")}>
            {/* Version Badge */}
            <div className="flex justify-center">
              {!isCollapsed ? (
                <Badge className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-600 border-blue-200 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  v2.0 Pro
                </Badge>
              ) : (
                <div className="w-6 h-6 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-blue-600" />
                </div>
              )}
            </div>
            
            {/* Copyright */}
            {!isCollapsed && (
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} OfinaPulse
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}