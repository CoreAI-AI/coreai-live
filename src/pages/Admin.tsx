import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, MessageSquare, Image as ImageIcon, TrendingUp, Activity, ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackStats {
  totalGood: number;
  totalBad: number;
  satisfactionRate: number;
}

interface LowRatedMessage {
  id: string;
  content: string;
  badCount: number;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck(user?.id);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    totalImages: 0,
    totalUsage: 0,
  });
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalGood: 0,
    totalBad: 0,
    satisfactionRate: 0,
  });
  const [lowRatedMessages, setLowRatedMessages] = useState<LowRatedMessage[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      toast.error('Access denied: Admin only');
      navigate('/');
    }
  }, [isAdmin, adminLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadFeedbackStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const [usersRes, chatsRes, messagesRes, imagesRes, usageRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('chats').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('generated_images').select('id', { count: 'exact', head: true }),
        supabase.from('usage_logs').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalChats: chatsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalImages: imagesRes.count || 0,
        totalUsage: usageRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
    }
  };

  const loadFeedbackStats = async () => {
    setLoadingFeedback(true);
    try {
      // Get all feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('message_feedback')
        .select('feedback_type, message_id');

      if (feedbackError) throw feedbackError;

      const totalGood = feedbackData?.filter(f => f.feedback_type === 'good').length || 0;
      const totalBad = feedbackData?.filter(f => f.feedback_type === 'bad').length || 0;
      const total = totalGood + totalBad;
      const satisfactionRate = total > 0 ? Math.round((totalGood / total) * 100) : 0;

      setFeedbackStats({ totalGood, totalBad, satisfactionRate });

      // Get messages with bad feedback
      const badFeedbackMessageIds = feedbackData
        ?.filter(f => f.feedback_type === 'bad')
        .map(f => f.message_id) || [];

      // Count occurrences of each message_id
      const messageCountMap = badFeedbackMessageIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get unique message IDs sorted by count
      const uniqueMessageIds = Object.entries(messageCountMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      if (uniqueMessageIds.length > 0) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('id, content, created_at')
          .in('id', uniqueMessageIds);

        const lowRated = (messagesData || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          badCount: messageCountMap[msg.id] || 0,
          created_at: msg.created_at,
        })).sort((a, b) => b.badCount - a.badCount);

        setLowRatedMessages(lowRated);
      }
    } catch (error) {
      console.error('Error loading feedback stats:', error);
      toast.error('Failed to load feedback statistics');
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-blue-500" },
    { icon: MessageSquare, label: "Total Chats", value: stats.totalChats, color: "text-green-500" },
    { icon: MessageSquare, label: "Messages", value: stats.totalMessages, color: "text-purple-500" },
    { icon: ImageIcon, label: "Images Generated", value: stats.totalImages, color: "text-pink-500" },
    { icon: Activity, label: "API Usage", value: stats.totalUsage, color: "text-orange-500" },
  ];

  const feedbackCards = [
    { icon: ThumbsUp, label: "Good Responses", value: feedbackStats.totalGood, color: "text-green-500" },
    { icon: ThumbsDown, label: "Bad Responses", value: feedbackStats.totalBad, color: "text-red-500" },
    { icon: TrendingUp, label: "Satisfaction Rate", value: `${feedbackStats.satisfactionRate}%`, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center core-glow">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                CoreAdmin
              </h1>
              <p className="text-xs text-muted-foreground">System Control Center</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Platform Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:core-glow">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feedback Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" />
              AI Response Quality
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {feedbackCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-primary/10 ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Low Rated Messages */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Low-Quality Responses
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Messages with negative feedback)
                </span>
              </h3>
              
              {loadingFeedback ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : lowRatedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No low-rated responses found. Great job!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {lowRatedMessages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-4 rounded-lg bg-muted/50 border border-border hover:border-red-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground line-clamp-3">
                              {msg.content.slice(0, 300)}
                              {msg.content.length > 300 && '...'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(msg.created_at).toLocaleDateString()} at{' '}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 shrink-0">
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{msg.badCount}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                System Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-sm text-primary">Lovable Cloud PostgreSQL</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm text-primary">Lovable Cloud Storage</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Authentication</span>
                    <span className="text-sm text-primary">Lovable Cloud Auth</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">AI Gateway</span>
                    <span className="text-sm text-primary">Lovable AI</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Admin;