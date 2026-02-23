-- Create table for message feedback
CREATE TABLE public.message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('good', 'bad')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, message_id)
);

-- Enable RLS
ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own feedback"
ON public.message_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.message_feedback
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
ON public.message_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.message_feedback
FOR DELETE
USING (auth.uid() = user_id);