-- 0003_charity_rls.sql

-- Enable RLS just in case it isn't
ALTER TABLE public.user_charities ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own charity selection
CREATE POLICY "Users can view own charity selection" 
ON public.user_charities 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own charity selection
CREATE POLICY "Users can insert own charity selection" 
ON public.user_charities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own charity selection
CREATE POLICY "Users can update own charity selection" 
ON public.user_charities 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
