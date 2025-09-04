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
    gradient: "from-blue-500 to-cyan-500",
    description: "Overview & insights"
  },
  { 
    key: "messages", 
    label: "All Messages", 
    icon: MessageCircle,
    gradient: "from-blue-500 to-teal-500",
    description: "Unified inbox"
  },
  { 
    key: "social-pages", 
    label: "Social Pages", 
    icon: Globe,
    gradient: "from-green-500 to-emerald-500",
    description: "Manage accounts"
  },
  { 
    key: "ai-assistant", 
    label: "AI Assistant", 
    icon: Brain,
    gradient: "from-purple-500 to-pink-500",
    description: "Smart assistant"
  },
  { 
    key: "analytics", 
    label: "Analytics", 
    icon: BarChart3,
    gradient: "from-orange-500 to-red-500",
    description: "Performance data"
  },
  { 
    key: "settings", 
    label: "Settings", 
    icon: Settings,
    gradient: "from-gray-500 to-slate-500",
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
  // Enforce light theme in sidebar
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden sidebar-content-transition" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative lg:translate-x-0 min-h-screen bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl border-r border-white/20 dark:border-white/10 flex flex-col z-50 sidebar-transition sidebar-accelerated shadow-2xl shadow-black/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-blue-500/5 before:to-teal-500/5 before:pointer-events-none",
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/10 after:to-transparent after:pointer-events-none",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-20" : "w-80"
      )}>
        {/* Header Section */}
        <div className="relative z-10 p-6 border-b border-white/10">
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
                    <h2 className="font-bold text-lg bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
                      OfinaPulse
                    </h2>
                    <p className="text-xs text-muted-foreground">Message Manager</p>
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
                className="hover:bg-white/10 w-8 h-8 sidebar-toggle-instant"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4 sidebar-toggle-instant" /> : <ChevronLeft className="h-4 w-4 sidebar-toggle-instant" />}
              </Button>
            </div>
            
            {/* Mobile Close Button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Status Indicator */}
          {!isCollapsed && (
            <div className="mt-4 flex items-center gap-2 sidebar-content-transition">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          )}
          
          {/* Collapsed Status Indicator */}
          {isCollapsed && (
            <div className="mt-4 flex justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className={cn("flex-1 py-6 space-y-2 relative z-10", isCollapsed ? "px-2" : "px-4")}>
          {navItems.map((item, index) => {
            const isSelected = selected === item.key;
            return (
              <div key={item.key} className="relative group">
                <button
                  className={cn(
                    "flex items-center w-full text-left sidebar-item-hover relative overflow-hidden",
                    "hover:bg-white/10 hover:backdrop-blur-sm hover:shadow-lg",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 before:sidebar-content-transition",
                    `before:${item.gradient}`,
                    "hover:before:opacity-10",
                    isSelected && "bg-white/15 backdrop-blur-sm shadow-lg scale-[1.02]",
                    isSelected && "before:opacity-15 border border-white/20",
                    isCollapsed ? "px-2 py-3 rounded-xl justify-center" : "px-4 py-4 rounded-2xl"
                  )}
                  onClick={() => handleItemClick(item.key)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Icon Container */}
                  <div className={cn(
                    "relative flex items-center justify-center rounded-xl sidebar-content-transition",
                    "bg-gradient-to-br shadow-lg group-hover:shadow-xl group-hover:scale-110",
                    `${item.gradient}`,
                    isSelected && "shadow-xl scale-110",
                    isCollapsed ? "w-10 h-10" : "w-12 h-12 mr-4"
                  )}>
                    <item.icon className={cn("text-white relative z-10", isCollapsed ? "w-4 h-4" : "w-5 h-5")} />
                    <div className={cn(
                      "absolute inset-0 rounded-xl blur-md opacity-0 sidebar-content-transition",
                      "bg-gradient-to-br group-hover:opacity-50",
                      `${item.gradient}`,
                      isSelected && "opacity-50"
                    )} />
                  </div>
                  
                  {/* Content - Only show when not collapsed */}
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-semibold text-sm sidebar-content-transition tracking-tight",
                          isSelected && "text-gray-900 font-bold",
                          !isSelected && "text-gray-700 group-hover:text-gray-900"
                        )}>
                          {item.label}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs sidebar-content-transition mt-1",
                        isSelected && "text-muted-foreground dark:text-white/70",
                        !isSelected && "text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-white/70"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  )}
                  

                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2",
                      isCollapsed ? "right-0 w-1 h-6" : "right-2 w-2 h-8"
                    )}>
                      <div className={cn(
                        "bg-gradient-to-b from-blue-400 to-teal-500 rounded-full shadow-lg animate-pulse",
                        isCollapsed ? "w-1 h-6" : "w-2 h-8"
                      )} />
                    </div>
                  )}
                  
                  {/* Hover Glow */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 sidebar-content-transition pointer-events-none",
                    "bg-gradient-to-r from-transparent via-white/5 to-transparent",
                    "group-hover:opacity-100",
                    isCollapsed ? "rounded-xl" : "rounded-2xl"
                  )} />
                </button>
              </div>
            );
          })}
        </nav>
        

        
        {/* Footer */}
        <div className={cn("relative z-10", isCollapsed ? "p-2" : "p-4")}>
          <div className={cn("text-center space-y-2", isCollapsed && "space-y-1")}>
            {/* Version Badge */}
            <div className="flex justify-center">
              {!isCollapsed ? (
                <Badge className="bg-gradient-to-r from-blue-500/20 to-teal-500/20 text-blue-400 border-blue-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  v2.0 Pro
                </Badge>
              ) : (
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500/20 to-teal-500/20 border border-blue-500/30 rounded flex items-center justify-center">
                  <Zap className="w-3 h-3 text-blue-400" />
                </div>
              )}
            </div>
            
            {/* Copyright - Only show when not collapsed */}
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} OfinaPulse
              </p>
            )}
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
      </aside>
    </>
  );
}
