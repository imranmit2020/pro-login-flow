import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  Menu,
  BarChart3,
  MessageSquare,
  Phone
} from "lucide-react";

interface TopNavigationProps {
  selectedSection: string;
  onSelect: (section: string) => void;
  analyticsSubSection: string;
  onAnalyticsSubSelect: (subSection: string) => void;
  onToggleSidebar: () => void;
}

export function TopNavigation({
  selectedSection,
  onSelect,
  analyticsSubSection,
  onAnalyticsSubSelect,
  onToggleSidebar
}: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Breadcrumb or section indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dashboard</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium capitalize">
              {selectedSection === 'home' ? 'Overview' : selectedSection}
            </span>
            {selectedSection === 'analytics' && analyticsSubSection && (
              <>
                <span className="text-sm text-muted-foreground">/</span>
                <Badge variant="secondary" className="text-xs">
                  {analyticsSubSection}
                </Badge>
              </>
            )}
          </div>
        </div>
        
        {/* Center section - Quick actions for analytics */}
        {selectedSection === 'analytics' && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={analyticsSubSection === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onAnalyticsSubSelect('overview')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={analyticsSubSection === 'messages' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onAnalyticsSubSelect('messages')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Messages
            </Button>
            <Button
              variant={analyticsSubSection === 'calls' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onAnalyticsSubSelect('calls')}
            >
              <Phone className="h-4 w-4 mr-1" />
              Calls
            </Button>
          </div>
        )}
        
        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* User menu */}
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}