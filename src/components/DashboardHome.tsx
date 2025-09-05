import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Mail, Facebook, Instagram, AlertCircle, ArrowRight, Calendar, Phone, BarChart3, FileText, TrendingUp, Megaphone, User, Bot, Settings, CheckSquare, Share2 } from "lucide-react";

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
          <div className="space-y-8 p-6">
            {/* Main Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-blue-600">Unified Message Manager</h1>
              <p className="text-gray-600 text-lg">
                Manage Facebook, Instagram, and Gmail messages with next-generation AI-powered insights
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-sm px-3 py-1">
                  Live
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-sm px-3 py-1">
                  Platforms Connected
                </Badge>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-blue-600">↑ 0 messages today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">New Contacts</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-green-600">↑ This week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Messages by Platform and Platform Status */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Messages by Platform (Today)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">No messages received today</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Platform Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Facebook</p>
                        <p className="text-xs text-gray-500">0 total messages</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      Disconnected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Instagram</p>
                        <p className="text-xs text-gray-500">0 total messages</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      Disconnected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Gmail</p>
                        <p className="text-xs text-gray-500">0 total messages</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                      Disconnected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Platform Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Facebook Messages</CardTitle>
                      <CardDescription>Patient conversations</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 w-fit">
                    Disconnected
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-xs text-gray-500">TODAY</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">0</p>
                      <p className="text-xs text-gray-500">TOTAL</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Facebook Messages
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Instagram Messages</CardTitle>
                      <CardDescription>Direct messages</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 w-fit">
                    Disconnected
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-xs text-gray-500">TODAY</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">0</p>
                      <p className="text-xs text-gray-500">TOTAL</p>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Instagram DMs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-red-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Gmail Messages</CardTitle>
                      <CardDescription>Email communications</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 w-fit">
                    Disconnected
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">0</p>
                      <p className="text-xs text-gray-500">TODAY</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">0</p>
                      <p className="text-xs text-gray-500">TOTAL</p>
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Connect Gmail
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'messages':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">All Messages</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Facebook className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Facebook Messages</h3>
                      <p className="text-sm text-gray-500">0 unread messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Instagram className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Instagram DMs</h3>
                      <p className="text-sm text-gray-500">0 unread messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Mail className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Gmail</h3>
                      <p className="text-sm text-gray-500">0 unread emails</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>Tasks requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No pending tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Completed Tasks</CardTitle>
                  <CardDescription>Recently completed tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No completed tasks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'social':
      case 'overview':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Share2 className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Social Media Overview</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <Facebook className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold">Facebook</h3>
                  <p className="text-sm text-gray-500">Manage your Facebook presence</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Instagram className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="text-sm text-gray-500">Manage your Instagram account</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="font-semibold">Email Marketing</h3>
                  <p className="text-sm text-gray-500">Email campaigns and newsletters</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                  <CardDescription>Create and schedule social media posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Create Post</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Posts</CardTitle>
                  <CardDescription>Manage your upcoming posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No scheduled posts</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Total Reach</h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Engagement</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Followers</h3>
                    <p className="text-3xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-500">Total followers</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Posts</h3>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                    <p className="text-sm text-gray-500">This month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'engagement':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Engagement</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Social Interactions</CardTitle>
                <CardDescription>Monitor likes, comments, and shares</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No engagement data available</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'campaigns':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Ad Broadcasting</CardTitle>
                <CardDescription>Create and manage advertising campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Create New Campaign</Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'social-accounts':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Share2 className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Social Accounts</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>Manage your connected social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No accounts connected</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Add Account</CardTitle>
                  <CardDescription>Connect new social media accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Connect Account</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>View customer demographics and behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No customer data available</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'calls':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Calls</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Calls</CardTitle>
                  <CardDescription>View your recent call history</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No recent calls</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Call Analytics</CardTitle>
                  <CardDescription>Track call performance and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No call data available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your appointments for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No appointments scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your upcoming appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No upcoming appointments</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-pink-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Smart Assistant</CardTitle>
                <CardDescription>Get AI-powered insights and automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-pink-800">AI Assistant is ready to help you manage your communications more efficiently.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  Start Chat with AI
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-gray-600" />
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure your notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Manage Notifications</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight capitalize">{section}</h1>
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
    <div className="min-h-screen bg-gray-50">
      {renderSection()}
    </div>
  );
}