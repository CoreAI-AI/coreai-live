-- Add images column to messages table
ALTER TABLE public.messages 
ADD COLUMN images JSONB;