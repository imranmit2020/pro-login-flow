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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  TrendingUp,
  Users,
  Megaphone,
  User,
  Bot
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  selected: string;
  onSelect: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  { id: 'home', label: 'Dashboard', icon: Home, subtitle: 'Overview & insights' },
  { id: 'messages', label: 'All Messages', icon: MessageSquare, subtitle: 'Unified inbox' },
];

const socialMediaItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, subtitle: 'Performance overview' },
  { id: 'posts', label: 'Posts', icon: FileText, subtitle: 'Create & schedule posts' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, subtitle: 'Insights & reports' },
  { id: 'engagement', label: 'Engagement', icon: Users, subtitle: 'Social interactions' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, subtitle: 'Ad broadcasting' },
  { id: 'social-accounts', label: 'Social Accounts', icon: Share2, subtitle: 'Connected accounts' },
  { id: 'customers', label: 'Customers', icon: User, subtitle: 'Audience insights' },
];

export function Sidebar({ 
  selected, 
  onSelect, 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  const [socialExpanded, setSocialExpanded] = useState(true);
  
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
        fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  O
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">OfinaPulse</h2>
                  <p className="text-xs text-gray-500">Message Manager</p>
                </div>
              </div>
            )}
            
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
          
          {/* Status badges */}
          {!isCollapsed && (
            <div className="p-4 space-y-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Online
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Active
              </Badge>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selected === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => onSelect(item.id)}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                  {!isCollapsed && (
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.subtitle}</div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Social Media Manager Section */}
            <div className="mt-4">
              <div
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                  ${selected.includes('social') || selected === 'overview' || selected === 'posts' || selected === 'analytics' || selected === 'engagement' || selected === 'campaigns' || selected === 'social-accounts' || selected === 'customers'
                    ? 'bg-purple-50 text-purple-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
                onClick={() => setSocialExpanded(!socialExpanded)}
              >
                <div className="flex items-center gap-3">
                  <Share2 className={`h-5 w-5 ${selected.includes('social') ? 'text-purple-500' : 'text-gray-400'}`} />
                  {!isCollapsed && (
                    <div>
                      <div className="text-sm font-medium">Social Media Manager</div>
                      <div className="text-xs text-gray-400">Complete social media suite</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="text-gray-400">
                    {socialExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                )}
              </div>
              
              {/* Social Media Subitems */}
              {socialExpanded && !isCollapsed && (
                <div className="ml-8 mt-2 space-y-1">
                  {socialMediaItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selected === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        className={`
                          flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all
                          ${isSelected 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'text-gray-500 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => onSelect(item.id)}
                      >
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-sm">{item.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* AI Assistant */}
            <div
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mt-4
                ${selected === 'ai-assistant'
                  ? 'bg-pink-50 text-pink-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => onSelect('ai-assistant')}
            >
              <Bot className={`h-5 w-5 ${selected === 'ai-assistant' ? 'text-pink-500' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <div>
                  <div className="text-sm font-medium">AI Assistant</div>
                  <div className="text-xs text-gray-400">Smart assistant</div>
                </div>
              )}
            </div>
            
            {/* Settings */}
            <div
              className={`
                flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                ${selected === 'settings'
                  ? 'bg-gray-50 text-gray-800' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => onSelect('settings')}
            >
              <Settings className={`h-5 w-5 ${selected === 'settings' ? 'text-gray-600' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <div>
                  <div className="text-sm font-medium">Settings</div>
                  <div className="text-xs text-gray-400">Configuration</div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}