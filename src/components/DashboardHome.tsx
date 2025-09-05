import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardHomeProps {
  section: string;
  analyticsSubSection: string;
  onAnalyticsSubSelect: (subSection: string) => void;
}

export function DashboardHome({ section, analyticsSubSection, onAnalyticsSubSelect }: DashboardHomeProps) {
  const renderSection = () => {
    switch (section) {
      case 'home':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">OfinaPulse Dashboard</h1>
              <p className="text-muted-foreground">
                Centralized communication and booking dashboard for your business
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last week
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from yesterday
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 pending completion
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'messages':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Unified Messages</h1>
            <Card>
              <CardHeader>
                <CardTitle>Message Center</CardTitle>
                <CardDescription>
                  Manage messages from Facebook, Instagram, and Gmail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Message management interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'tasks':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <Card>
              <CardHeader>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Track and manage your daily tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Task management interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <div className="flex gap-2 mb-4">
              <Badge 
                variant={analyticsSubSection === 'overview' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => onAnalyticsSubSelect('overview')}
              >
                Overview
              </Badge>
              <Badge 
                variant={analyticsSubSection === 'messages' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => onAnalyticsSubSelect('messages')}
              >
                Messages
              </Badge>
              <Badge 
                variant={analyticsSubSection === 'calls' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => onAnalyticsSubSelect('calls')}
              >
                Calls
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics for {analyticsSubSection || 'all metrics'} coming soon...
                </p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'calls':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
            <Card>
              <CardHeader>
                <CardTitle>Call Management</CardTitle>
                <CardDescription>
                  Manage and track your calls with ElevenLabs integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Call management interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure your dashboard preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{section}</h1>
            <Card>
              <CardHeader>
                <CardTitle>Section: {section}</CardTitle>
                <CardDescription>
                  This section is under development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Content for {section} coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderSection()}
    </div>
  );
}