-- Fix the conflicting policies - remove the public access policy to ensure emails stay private
DROP POLICY IF EXISTS "Display names are publicly viewable" ON public.profiles;

-- Now only the "Users can view their own profile" policy remains, which properly protects email addresses
-- Users can only access their own profile data, keeping emails and other sensitive info secure