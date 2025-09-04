"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  MessageCircle, 
  Instagram, 
  ExternalLink,
  Shield,
  Bell,
  Database,
  Webhook
} from "lucide-react";
import Link from "next/link";
import { FacebookSyncControl } from "@/components/FacebookSyncControl";

const AdminIndexPage: React.FC = () => {
  const adminSections = [
    {
      title: "Facebook Messenger",
      description: "Manage Facebook Messenger webhook configuration and test messaging integration",
      icon: MessageCircle,
      href: "/admin/facebook",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: ["Webhook verification", "Message testing", "Storage monitoring", "Configuration validation"]
    },
    {
      title: "Instagram",
      description: "Configure Instagram page subscriptions and manage messaging events",
      icon: Instagram,
      href: "/admin/instagram",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      features: ["Page subscriptions", "Event configuration", "Graph API integration", "Webhook testing"]
    }
  ];

  const systemStatus = [
    {
      name: "Facebook Webhook",
      status: "configured",
      description: "Webhook endpoint for Facebook Messenger events"
    },
    {
      name: "Instagram Webhook", 
      status: "configured",
      description: "Webhook endpoint for Instagram messaging events"
    },
    {
      name: "Message Storage",
      status: "active",
      description: "In-memory storage for incoming messages (both platforms)"
    },
    {
      name: "Separate Processing",
      status: "active", 
      description: "Platform-specific message handling and storage"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-bold">Social Media Administration</h1>
          <p className="text-muted-foreground">Manage webhooks, test integrations, and configure social media messaging</p>
        </div>
      </div>

      {/* Facebook Sync Control */}
      <FacebookSyncControl />

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>Current status of social media integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Available Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Link href={section.href} className="block">
                  <Button className="w-full">
                    <span>Manage {section.title}</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/facebook" className="block">
              <Button variant="outline" className="w-full h-auto p-4 flex-col space-y-2">
                <Webhook className="h-6 w-6" />
                <span>Test Facebook Webhook</span>
              </Button>
            </Link>
            
            <Link href="/admin/instagram" className="block">
              <Button variant="outline" className="w-full h-auto p-4 flex-col space-y-2">
                <Bell className="h-6 w-6" />
                <span>Configure Instagram Subscriptions</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-auto p-4 flex-col space-y-2" asChild>
              <Link href="/">
                <Database className="h-6 w-6" />
                <span>View Messages Dashboard</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation & Guides</CardTitle>
          <CardDescription>Reference materials and setup guides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Facebook & Instagram Separation Guide</h4>
                <p className="text-sm text-muted-foreground">Complete guide on the new separated architecture</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/FACEBOOK_INSTAGRAM_SEPARATION_GUIDE.md" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </a>
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Instagram Setup Guide</h4>
                <p className="text-sm text-muted-foreground">Step-by-step Instagram messaging configuration</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/instagram-messaging-setup-guide.md" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </a>
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Facebook Messenger Integration</h4>
                <p className="text-sm text-muted-foreground">Documentation for Facebook Messenger setup</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/docs/facebook-messenger-integration.md" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIndexPage;
