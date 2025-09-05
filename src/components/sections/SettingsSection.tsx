"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Zap,
  Phone,
  MessageSquare,
  Mail
} from "lucide-react";

export function SettingsSection() {
  const settingCategories = [
    {
      title: "Profile Settings",
      icon: User,
      description: "Manage your account and personal information",
      items: ["Personal Information", "Account Security", "Privacy Settings"]
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Configure how you receive alerts and updates",
      items: ["Email Notifications", "Push Notifications", "SMS Alerts"]
    },
    {
      title: "Integrations",
      icon: Zap,
      description: "Connect and manage third-party services",
      items: ["Facebook Pages", "Instagram Business", "Gmail Account", "ElevenLabs AI"]
    },
    {
      title: "Call Settings",
      icon: Phone,
      description: "Configure AI call assistant settings",
      items: ["Voice Settings", "Call Routing", "AI Responses", "Recording Options"]
    }
  ];

  const integrationStatus = [
    { name: "Facebook", status: "Connected", color: "bg-blue-100 text-blue-800" },
    { name: "Instagram", status: "Connected", color: "bg-pink-100 text-pink-800" },
    { name: "Gmail", status: "Connected", color: "bg-red-100 text-red-800" },
    { name: "ElevenLabs", status: "Connected", color: "bg-purple-100 text-purple-800" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account, integrations, and preferences</p>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrationStatus.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-gray-900">{integration.name}</span>
                <Badge className={integration.color}>{integration.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <category.icon className="h-5 w-5 text-blue-600" />
                </div>
                {category.title}
              </CardTitle>
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Security Audit</p>
                  <p className="text-sm text-gray-600">Review account security</p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-gray-600">Download your data</p>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex flex-col items-start gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Appearance</p>
                  <p className="text-sm text-gray-600">Customize interface</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}