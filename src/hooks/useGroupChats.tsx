import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GroupChat {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const useGroupChats = (userId: string | undefined) => {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [currentGroup, setCurrentGroup] = useState<GroupChat | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's groups
  useEffect(() => {
    if (!userId) return;

    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data || []);
      }
      setLoading(false);
    };

    fetchGroups();
  }, [userId]);

  // Fetch messages for current group with realtime subscription
  useEffect(() => {
    if (!currentGroup) {
      setMessages([]);
      setMembers([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', currentGroup.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', currentGroup.id);

      if (!error && data) {
        setMembers(data as GroupMember[]);
      }
    };

    fetchMessages();
    fetchMembers();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group-${currentGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${currentGroup.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as GroupMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentGroup]);

  const createGroup = async (name: string, description?: string) => {
    if (!userId) return null;

    const { data: group, error: groupError } = await supabase
      .from('group_chats')
      .insert({
        name,
        description,
        created_by: userId
      })
      .select()
      .single();

    if (groupError) {
      toast.error('Failed to create group');
      console.error('Error creating group:', groupError);
      return null;
    }

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) {
      console.error('Error adding creator as member:', memberError);
    }

    setGroups(prev => [group, ...prev]);
    toast.success('Group created successfully');
    return group;
  };

  const selectGroup = (group: GroupChat) => {
    setCurrentGroup(group);
  };

  const sendMessage = async (content: string) => {
    if (!userId || !currentGroup) return null;

    const { data, error } = await supabase
      .from('group_messages')
      .insert({
        group_id: currentGroup.id,
        user_id: userId,
        content
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  };

  const addMember = async (memberUserId: string) => {
    if (!currentGroup) return false;

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: currentGroup.id,
        user_id: memberUserId,
        role: 'member'
      });

    if (error) {
      toast.error('Failed to add member');
      console.error('Error adding member:', error);
      return false;
    }

    toast.success('Member added successfully');
    // Refresh members
    const { data } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', currentGroup.id);
    
    if (data) setMembers(data as GroupMember[]);
    return true;
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast.error('Failed to remove member');
      return false;
    }

    setMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success('Member removed');
    return true;
  };

  const deleteGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('group_chats')
      .delete()
      .eq('id', groupId);

    if (error) {
      toast.error('Failed to delete group');
      return false;
    }

    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (currentGroup?.id === groupId) {
      setCurrentGroup(null);
    }
    toast.success('Group deleted');
    return true;
  };

  const leaveGroup = async () => {
    if (!userId || !currentGroup) return false;

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', currentGroup.id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to leave group');
      return false;
    }

    setGroups(prev => prev.filter(g => g.id !== currentGroup.id));
    setCurrentGroup(null);
    toast.success('Left the group');
    return true;
  };

  return {
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
  };
};