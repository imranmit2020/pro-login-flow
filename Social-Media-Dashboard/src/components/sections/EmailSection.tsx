"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Paperclip, Archive, Reply, Forward, Trash2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useGmail, GmailEmail } from "@/hooks/useGmail";

export function EmailSection() {
  const {
    emails,
    loading,
    backgroundLoading,
    error,
    isAuthenticated,
    authenticateGmail,
    fetchEmails,
    sendReply,
    sendEmail
  } = useGmail();

  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: ""
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails({ limit: 20 });
    }
  }, [isAuthenticated, fetchEmails]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredEmails = emails.filter(email =>
    email.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReply = async () => {
    if (replyText.trim() && selectedEmail) {
      try {
        await sendReply({
          threadId: selectedEmail.threadId,
          replyText,
          recipientEmail: selectedEmail.sender.email,
          subject: selectedEmail.subject
        });
        setReplyText("");
        alert('Reply sent successfully!');
      } catch {
        alert('Failed to send reply. Please try again.');
      }
    }
  };

  const handleCompose = async () => {
    if (composeData.to && composeData.subject && composeData.body) {
      try {
        await sendEmail(composeData);
        setComposeData({ to: "", subject: "", body: "" });
        setShowCompose(false);
        alert('Email sent successfully!');
      } catch {
        alert('Failed to send email. Please try again.');
      }
    }
  };

  const handleRefresh = () => {
    if (isAuthenticated) {
      fetchEmails({ limit: 20 });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Email Management</h2>
            <p className="text-muted-foreground">Gmail integration for patient communications</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" />
              Connect Gmail Account
            </CardTitle>
            <CardDescription>
              Authenticate with your Gmail account to start managing emails
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <Button onClick={authenticateGmail} className="w-full max-w-sm">
              <Mail className="h-4 w-4 mr-2" />
              Authenticate Gmail
            </Button>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              You&apos;ll be redirected to Google to sign in and authorize access to your Gmail account.
              This allows the dashboard to read and send emails on your behalf.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Management</h2>
          <p className="text-muted-foreground">Gmail integration for patient communications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Gmail Connected
          </Badge>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading || backgroundLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {backgroundLoading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
          <Button size="sm" onClick={() => setShowCompose(!showCompose)}>
            <Mail className="h-4 w-4 mr-1" />
            Compose
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Compose New Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">To:</label>
              <input
                type="email"
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject:</label>
              <input
                type="text"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message:</label>
              <textarea
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md h-32"
                placeholder="Your message..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCompose} disabled={loading}>
                Send Email
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Inbox
            </CardTitle>
            <CardDescription>
              {filteredEmails.filter(e => e.status === 'unread').length} unread emails
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {loading && emails.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading emails...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No emails found</p>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id 
                      ? 'bg-accent border-accent-foreground/20' 
                      : 'hover:bg-muted/50'
                  } ${email.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${email.status === 'unread' ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <span className={`font-medium text-sm truncate ${email.status === 'unread' ? 'font-bold' : ''}`}>
                        {email.sender.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {email.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <p className={`text-sm mt-1 truncate ${email.status === 'unread' ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {email.snippet}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1">
                      {email.labels.filter(label => !['INBOX', 'UNREAD', 'SENT'].includes(label)).slice(0, 2).map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(email.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Email Detail */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedEmail ? selectedEmail.subject : 'Select an email'}
            </CardTitle>
            {selectedEmail && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button size="sm" variant="outline">
                  <Forward className="h-3 w-3 mr-1" />
                  Forward
                </Button>
                <Button size="sm" variant="outline">
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{selectedEmail.sender.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedEmail.sender.email}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(selectedEmail.timestamp)}
                    </span>
                  </div>
                  {selectedEmail.hasAttachments && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Paperclip className="h-3 w-3" />
                      <span>Has attachments</span>
                    </div>
                  )}
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedEmail.body}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Quick Reply</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 border rounded-md h-24 text-sm"
                    placeholder="Type your reply..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleReply} disabled={!replyText.trim() || loading}>
                        <Reply className="h-3 w-3 mr-1" />
                        Send Reply
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Reply to: {selectedEmail.sender.email}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2" />
                <p>Select an email to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 