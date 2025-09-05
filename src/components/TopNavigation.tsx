import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Home,
  CheckSquare,
  Share2,
  Phone,
  Calendar,
  BarChart3
} from "lucide-react";

interface TopNavigationProps {
  selectedSection: string;
  onSelect: (section: string) => void;
  analyticsSubSection: string;
  onAnalyticsSubSelect: (subSection: string) => void;
  onToggleSidebar: () => void;
}

const topNavItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function TopNavigation({
  selectedSection,
  onSelect,
  analyticsSubSection,
  onAnalyticsSubSelect,
  onToggleSidebar
}: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left section - Navigation */}
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = selectedSection === item.id;
              
              return (
                <button
                  key={item.id}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onSelect(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Right section - User info */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              IA
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Imran Ahmed</p>
              <p className="text-xs text-gray-500">MUHAMMAD200@GMAIL.COM</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}