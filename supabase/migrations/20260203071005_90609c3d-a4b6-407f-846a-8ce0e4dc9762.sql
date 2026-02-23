-- Drop the problematic recursive policies on group_members
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;

-- Also drop problematic policies on group_chats that reference group_members
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.group_chats;
DROP POLICY IF EXISTS "Group admins can update groups" ON public.group_chats;

-- Also drop problematic policies on group_messages that reference group_members
DROP POLICY IF EXISTS "Users can view messages in their groups" ON public.group_messages;
DROP POLICY IF EXISTS "Users can send messages to their groups" ON public.group_messages;

-- Create a helper function to check group membership (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_uuid AND user_id = user_uuid
  );
$$;

-- Create a helper function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(group_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = group_uuid AND user_id = user_uuid AND role = 'admin'
  );
$$;

-- Recreate group_members policies using helper functions
CREATE POLICY "Users can view members of their groups" 
ON public.group_members 
FOR SELECT 
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Group admins can add members" 
ON public.group_members 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_group_admin(group_id, auth.uid())
);

CREATE POLICY "Group admins can remove members" 
ON public.group_members 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR public.is_group_admin(group_id, auth.uid())
);

-- Recreate group_chats policies using helper functions
CREATE POLICY "Users can view groups they are members of" 
ON public.group_chats 
FOR SELECT 
USING (public.is_group_member(id, auth.uid()));

CREATE POLICY "Group admins can update groups" 
ON public.group_chats 
FOR UPDATE 
USING (public.is_group_admin(id, auth.uid()));

-- Recreate group_messages policies using helper functions
CREATE POLICY "Users can view messages in their groups" 
ON public.group_messages 
FOR SELECT 
USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can send messages to their groups" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND public.is_group_member(group_id, auth.uid())
);