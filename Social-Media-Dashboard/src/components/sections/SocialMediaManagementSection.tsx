"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Send, 
  Calendar, 
  Image, 
  Sparkles,
  BarChart3,
  Layout,
  Facebook,
  Instagram,
  Linkedin,
  Heart,
  MessageCircle,
  Share,
  Eye
} from "lucide-react";

interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'published';
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

export function SocialMediaManagementSection() {
  const [activeTab, setActiveTab] = useState("composer");
  const [posts] = useState<Post[]>([]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-violet-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Social Media Management
            </h1>
            <p className="text-gray-600">
              Create, schedule, and manage your dental practice's social media presence across all platforms.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Multi-Platform
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "composer", label: "Post Composer", icon: Plus },
            { id: "calendar", label: "Content Calendar", icon: Calendar },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "templates", label: "Templates", icon: Layout }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === "composer" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Post Composer */}
            <Card className="border-violet-100">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-violet-600" />
                  Create New Post
                </CardTitle>
                <CardDescription>
                  Craft engaging content for your dental practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <textarea
                    placeholder="Share updates about your dental practice, tips for oral health, or showcase your services..."
                    className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Platforms
                  </label>
                  <div className="flex gap-2">
                    {[
                      { name: "Facebook", icon: Facebook, color: "blue" },
                      { name: "Instagram", icon: Instagram, color: "pink" },
                      { name: "LinkedIn", icon: Linkedin, color: "blue" }
                    ].map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <Button
                          key={platform.name}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {platform.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700">
                    <Send className="w-4 h-4 mr-2" />
                    Post Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Content Assistant
                </CardTitle>
                <CardDescription>
                  Generate engaging content tailored for dental practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Oral Health Tips",
                    "Service Showcase",
                    "Patient Testimonial",
                    "Appointment Reminder",
                    "Dental Care Facts",
                    "Practice Updates"
                  ].map((template) => (
                    <Button
                      key={template}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
                
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                View and manage your scheduled posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Calendar</h3>
                <p className="text-gray-600">Your content calendar will appear here with scheduled posts.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Reach", value: "0", icon: Eye, color: "blue" },
              { label: "Engagement", value: "0", icon: Heart, color: "red" },
              { label: "Comments", value: "0", icon: MessageCircle, color: "green" },
              { label: "Shares", value: "0", icon: Share, color: "purple" }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 text-${stat.color}-500`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "templates" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>
                Pre-designed templates for dental practice content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Template Library</h3>
                <p className="text-gray-600">Browse and use professional templates for your posts.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}