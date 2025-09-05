"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  CheckSquare,
  Mail,
  Calendar,
  Phone,
  BarChart3,
  Settings,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface SidebarProps {
  selected: string;
  onSelect: (section: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ 
  selected, 
  onSelect, 
  isOpen = false, 
  onClose,
  isCollapsed = false,
  onToggleCollapse 
}: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "calls", label: "Calls", icon: Phone },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "social-pages", label: "Social Pages", icon: Users },
    { id: "ai-assistant", label: "AI Assistant", icon: Zap },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OP</span>
                </div>
                <span className="font-semibold text-gray-900">OfinaPulse</span>
              </div>
            )}
            
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Desktop Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={selected === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isCollapsed && "justify-center"
                )}
                onClick={() => {
                  onSelect(item.id);
                  if (onClose) onClose();
                }}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                OfinaPulse Dashboard v1.0
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}