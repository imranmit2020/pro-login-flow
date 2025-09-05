import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Phone,
  Calendar,
  Mail,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  selected: string;
  onSelect: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ 
  selected, 
  onSelect, 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen bg-background border-r border-border
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">OfinaPulse</h2>
            )}
            
            <div className="flex items-center gap-2">
              {/* Desktop collapse toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="hidden lg:flex"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              
              {/* Mobile close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selected === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isSelected ? "default" : "ghost"}
                  className={`w-full justify-start ${isCollapsed ? 'px-2' : ''}`}
                  onClick={() => onSelect(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-border">
            {!isCollapsed ? (
              <div className="text-xs text-muted-foreground">
                <p>OfinaPulse v1.0.0</p>
                <p>Smart Dental Unified Messenger</p>
              </div>
            ) : (
              <Badge variant="outline" className="w-full justify-center">
                v1.0
              </Badge>
            )}
          </div>
        </div>
      </div>
    </>
  );
}