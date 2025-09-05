"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Send, 
  Calendar, 
  Image, 
  Video, 
  FileText, 
  Hash, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Heart, 
  MessageCircle, 
  Share, 
  Eye,
  Sparkles,
  Brain,
  Wand2,
  Layout,
  BarChart3,
  Settings,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  ChevronDown,
  Filter,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  CalendarDays,
  Zap,
  Camera,
  Palette,
  Type
} from "lucide-react";
import { useLightTheme } from "@/hooks/useLightTheme";

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
  media?: {
    type: 'image' | 'video' | 'carousel';
    url: string;
    alt?: string;
  }[];
  tags: string[];
  createdAt: Date;
  publishedAt?: Date;
}

interface ContentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  tags: string[];
  preview: string;
}

export function SocialMediaManagementSection() {
  // Enforce light theme
  useLightTheme();

  const [activeTab, setActiveTab] = useState<'create' | 'scheduled' | 'published' | 'analytics' | 'templates'>('create');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');

  // Mock data for demonstration
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Transform your smile with our state-of-the-art dental technology! ✨ Book your consultation today and discover the difference professional care makes.',
      platforms: ['facebook', 'instagram'],
      status: 'scheduled',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tags: ['dental', 'smile', 'consultation'],
      createdAt: new Date(),
      engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
    },
    {
      id: '2',
      content: 'Did you know regular dental cleanings can prevent 90% of dental issues? 🦷 Schedule your cleaning appointment today!',
      platforms: ['facebook', 'instagram', 'linkedin'],
      status: 'published',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      tags: ['prevention', 'cleaning', 'health'],
      createdAt: new Date(),
      engagement: { likes: 45, comments: 8, shares: 12, reach: 892 }
    }
  ]);

  const contentTemplates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Dental Health Tips',
      category: 'Educational',
      content: 'Did you know that [TIP]? 🦷 Here\'s how you can maintain optimal oral health: [ADVICE]. Book your appointment today!',
      tags: ['health', 'tips', 'education'],
      preview: 'Educational content about dental health and care tips'
    },
    {
      id: '2',
      name: 'Before & After Showcase',
      category: 'Social Proof',
      content: 'Amazing transformation! ✨ Our patient\'s journey from [BEFORE] to [AFTER] shows what professional dental care can achieve. Ready for your transformation?',
      tags: ['transformation', 'results', 'showcase'],
      preview: 'Showcase patient transformations and results'
    },
    {
      id: '3',
      name: 'Appointment Reminder',
      category: 'Engagement',
      content: 'Don\'t forget about your upcoming appointment on [DATE] at [TIME]! 📅 We\'re looking forward to seeing you. Call us if you need to reschedule.',
      tags: ['appointment', 'reminder', 'service'],
      preview: 'Friendly appointment reminders for patients'
    },
    {
      id: '4',
      name: 'New Technology Announcement',
      category: 'Innovation',
      content: 'Exciting news! 🚀 We\'ve just introduced [TECHNOLOGY] to our practice. This means [BENEFITS] for our patients. Experience the future of dental care!',
      tags: ['technology', 'innovation', 'announcement'],
      preview: 'Announce new technologies and innovations'
    }
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const applyTemplate = (template: ContentTemplate) => {
    setPostContent(template.content);
    setHashtags([...hashtags, ...template.tags.filter(tag => !hashtags.includes(tag))]);
    setSelectedTemplate(template);
  };

  const generateAIContent = async () => {
    // Simulate AI content generation
    setIsAiAssistantOpen(true);
    // TODO: Integrate with OpenAI API for actual content generation
    setTimeout(() => {
      const aiSuggestions = [
        "Looking for a brighter smile? Our professional teeth whitening service can give you results in just one visit! ✨ Book your appointment today and see the difference.",
        "Your oral health is our priority! 🦷 Regular check-ups every 6 months can prevent serious dental issues. Schedule your visit today!",
        "New patient special! 🎉 Get a comprehensive dental exam, cleaning, and X-rays for just $99. Limited time offer - call now to book!"
      ];
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setPostContent(randomSuggestion);
      setIsAiAssistantOpen(false);
    }, 2000);
  };

  const schedulePost = () => {
    if (postContent.trim() && selectedPlatforms.length > 0) {
      const newPost: Post = {
        id: Date.now().toString(),
        content: postContent,
        platforms: selectedPlatforms,
        scheduledDate: scheduledDate || undefined,
        status: scheduledDate ? 'scheduled' : 'draft',
        tags: hashtags,
        createdAt: new Date(),
        engagement: { likes: 0, comments: 0, shares: 0, reach: 0 }
      };
      setPosts([newPost, ...posts]);
      setPostContent('');
      setHashtags([]);
      setScheduledDate(null);
      setSelectedTemplate(null);
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Post', icon: Plus, description: 'Create new content' },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar, description: 'Upcoming posts' },
    { id: 'published', label: 'Published', icon: Send, description: 'Live content' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance insights' },
    { id: 'templates', label: 'Templates', icon: Layout, description: 'Content templates' }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-violet-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Social Media Manager
            </h1>
            <p className="text-gray-600">
              Create, schedule, and manage your dental practice's social media presence with AI-powered tools
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Globe className="w-3 h-3 mr-1" />
              Multi-Platform
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <span className="font-medium text-sm">{tab.label}</span>
                {activeTab !== tab.id && (
                  <span className="text-xs text-gray-400 hidden lg:block">
                    {tab.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content Creation */}
          <div className="xl:col-span-2 space-y-6">
            {/* Post Content */}
            <Card className="border-2 border-dashed border-violet-200 bg-gradient-to-br from-white to-violet-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-violet-600" />
                  Create Your Post
                </CardTitle>
                <CardDescription>
                  Write engaging content for your dental practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What would you like to share with your patients today?"
                    className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {postContent.length}/280
                  </div>
                </div>

                {/* AI Content Generation */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    onClick={generateAIContent}
                    variant="outline" 
                    size="sm"
                    disabled={isAiAssistantOpen}
                    className="border-violet-200 text-violet-600 hover:bg-violet-50"
                  >
                    {isAiAssistantOpen ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-violet-600 mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Brain className="w-3 h-3 mr-2" />
                        AI Suggest
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200">
                    <Type className="w-3 h-3 mr-2" />
                    Templates
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-200">
                    <Palette className="w-3 h-3 mr-2" />
                    Style
                  </Button>
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hashtags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hashtags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-violet-100 text-violet-700 hover:bg-violet-200 cursor-pointer"
                        onClick={() => removeHashtag(tag)}
                      >
                        #{tag}
                        <button className="ml-1 hover:text-violet-900">×</button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentHashtag}
                      onChange={(e) => setCurrentHashtag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                      placeholder="Add hashtag..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <Button onClick={addHashtag} size="sm" variant="outline">
                      <Hash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Add photos or videos</p>
                  <p className="text-xs text-gray-400">PNG, JPG, MP4 up to 10MB</p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Publishing Platforms
                </CardTitle>
                <CardDescription>
                  Choose where to publish your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? `${platform.bg} ${platform.border} ${platform.color} bg-opacity-20`
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? platform.color : 'text-gray-400'}`} />
                        <p className="text-sm font-medium">{platform.name}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Schedule Post
                </CardTitle>
                <CardDescription>
                  Choose when to publish your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Button 
                    onClick={() => setScheduledDate(null)}
                    variant={!scheduledDate ? "default" : "outline"}
                    size="sm"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Publish Now
                  </Button>
                  <Button 
                    onClick={() => setScheduledDate(new Date())}
                    variant={scheduledDate ? "default" : "outline"}
                    size="sm"
                  >
                    <CalendarDays className="w-3 h-3 mr-2" />
                    Schedule
                  </Button>
                  {scheduledDate && (
                    <input
                      type="datetime-local"
                      onChange={(e) => setScheduledDate(new Date(e.target.value))}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button 
                onClick={schedulePost}
                disabled={!postContent.trim() || selectedPlatforms.length === 0}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {scheduledDate ? 'Schedule Post' : 'Publish Now'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posts This Week</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <Badge className="bg-green-100 text-green-700">+15%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reach</span>
                  <Badge variant="secondary">2.4K</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Content Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Popular Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentTemplates.slice(0, 3).map((template) => (
                  <div 
                    key={template.id}
                    className="p-3 border border-gray-100 rounded-lg hover:border-violet-200 cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{template.preview}</p>
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Optimal Posting Times */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Best Times to Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Facebook</span>
                  <span className="font-medium">2-3 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Instagram</span>
                  <span className="font-medium">11 AM-1 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">LinkedIn</span>
                  <span className="font-medium">9-10 AM</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Other tab contents would go here */}
      {activeTab === 'scheduled' && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Scheduled Posts</h3>
          <p className="text-gray-600">Your upcoming scheduled posts will appear here.</p>
        </div>
      )}

      {activeTab === 'published' && (
        <div className="text-center py-12">
          <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Published Posts</h3>
          <p className="text-gray-600">Your published posts and their performance will appear here.</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600">Detailed analytics and insights coming soon.</p>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Templates</h3>
          <p className="text-gray-600">Browse and manage your content templates.</p>
        </div>
      )}
    </div>
  );
}