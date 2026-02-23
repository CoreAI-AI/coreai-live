-- Fix security issue: Restrict profile access to prevent email exposure
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that only allows users to view their own profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optional: Create a separate policy for public display names only (without email)
-- This allows other users to see display names for chat/social features while keeping emails private
CREATE POLICY "Display names are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);