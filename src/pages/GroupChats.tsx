import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroupChats } from "@/hooks/useGroupChats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Send, 
  MoreVertical,
  UserPlus,
  LogOut,
  Trash2,
  Crown,
  User,
  Menu,
  X,
  MessageCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const GroupChats = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    groups,
    currentGroup,
    members,
    messages,
    loading,
    createGroup,
    selectGroup,
    sendMessage,
    addMember,
    removeMember,
    deleteGroup,
    leaveGroup,
    setCurrentGroup
  } = useGroupChats(user?.id);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle mobile sidebar toggle
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    const group = await createGroup(newGroupName.trim(), newGroupDescription.trim() || undefined);
    if (group) {
      setNewGroupName("");
      setNewGroupDescription("");
      setCreateDialogOpen(false);
      selectGroup(group);
      if (isMobile) setShowSidebar(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    await sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleAddMember = async () => {
    if (!newMemberId.trim()) return;
    
    const success = await addMember(newMemberId.trim());
    if (success) {
      setNewMemberId("");
      setAddMemberDialogOpen(false);
    }
  };

  const handleSelectGroup = (group: any) => {
    selectGroup(group);
    if (isMobile) setShowSidebar(false);
  };

  const isAdmin = members.some(m => m.user_id === user.id && m.role === 'admin');
  const isCreator = currentGroup?.created_by === user.id;

  // Groups Sidebar Component
  const GroupsSidebar = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Groups</h1>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-10"
                />
                <Input
                  placeholder="Description (optional)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className="h-10"
                />
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs">Create one to start chatting</p>
          </div>
        ) : (
          <AnimatePresence>
            {groups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full text-left p-2.5 rounded-lg transition-all mb-1 ${
                    currentGroup?.id === group.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Groups Sidebar - ChatGPT Style */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={isMobile ? { x: -280 } : { opacity: 1 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: -280 } : { opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`${
              isMobile 
                ? 'fixed left-0 top-0 h-full w-[280px] z-50' 
                : 'w-72 border-r border-border'
            }`}
          >
            <GroupsSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentGroup ? (
          <>
            {/* Chat Header - ChatGPT Style */}
            <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between shrink-0 bg-background">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {(!showSidebar || isMobile) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSidebar(true)}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                )}
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base text-foreground truncate">{currentGroup.name}</h2>
                  <p className="text-xs text-muted-foreground">{members.length} members</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Members Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Users className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle>Members ({members.length})</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-2">
                      {isAdmin && (
                        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <UserPlus className="w-4 h-4" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Member</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <Input
                                placeholder="User ID"
                                value={newMemberId}
                                onChange={(e) => setNewMemberId(e.target.value)}
                              />
                              <Button onClick={handleAddMember} className="w-full">
                                Add Member
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <div className="space-y-2 mt-4">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                {member.role === 'admin' ? (
                                  <Crown className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {member.user_id === user.id ? 'You' : member.user_id.slice(0, 8) + '...'}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                              </div>
                            </div>
                            {isAdmin && member.user_id !== user.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMember(member.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Group Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={leaveGroup}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Group
                    </DropdownMenuItem>
                    {isCreator && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteGroup(currentGroup.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages - Native scroll like ChatGPT */}
            <div 
              className="flex-1 overflow-y-auto p-3 sm:p-4 overscroll-behavior-y-contain" 
              ref={scrollRef}
            >
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.user_id === user.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-3 py-2 ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            {!isMe && (
                              <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                                {message.user_id.slice(0, 8)}...
                              </p>
                            )}
                            <p className="text-sm leading-relaxed break-words whitespace-normal">{message.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {isMe && (
                            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                              U
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="p-3 sm:p-4 border-t border-border bg-background shrink-0">
              <div className="max-w-3xl mx-auto flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-2xl px-3 py-1.5 border border-border focus-within:border-primary/50 transition-colors">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-9 px-0"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  size="sm"
                  disabled={!messageInput.trim()}
                  className="h-10 w-10 rounded-xl gradient-bg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Empty state header on mobile */}
            {isMobile && !showSidebar && (
              <div className="p-3 border-b border-border flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSidebar(true)}
                  className="h-8 w-8 p-0"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">Group Chats</span>
              </div>
            )}
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <Users className="w-14 h-14 mx-auto mb-4 opacity-50" />
                <h3 className="text-base font-medium mb-2">Select a group</h3>
                <p className="text-sm">Choose a group from the sidebar to start chatting</p>
                {isMobile && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSidebar(true)}
                    className="mt-4"
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    View Groups
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChats;