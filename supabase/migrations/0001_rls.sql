-- 0001_rls.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Policies for Profiles
-- -----------------------------------------------------------------------------
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Policies for Subscription Plans
-- -----------------------------------------------------------------------------
-- Anyone can view active subscription plans
CREATE POLICY "Anyone can view active plans" 
ON public.subscription_plans FOR SELECT 
USING (active = true);

-- -----------------------------------------------------------------------------
-- Policies for Subscriptions
-- -----------------------------------------------------------------------------
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Policies for Scores
-- -----------------------------------------------------------------------------
-- Users can view their own scores
CREATE POLICY "Users can view own scores" 
ON public.scores FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY "Users can insert own scores" 
ON public.scores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Policies for Charities
-- -----------------------------------------------------------------------------
-- Anyone can view approved charities
CREATE POLICY "Anyone can view approved charities" 
ON public.charities FOR SELECT 
USING (active = true);

-- -----------------------------------------------------------------------------
-- Policies for Donations
-- -----------------------------------------------------------------------------
-- Users can view their own donations
CREATE POLICY "Users can view own donations" 
ON public.donations FOR SELECT 
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Policies for Draws & Prize Pools
-- -----------------------------------------------------------------------------
-- Anyone can view draws and prize pools
CREATE POLICY "Anyone can view draws" 
ON public.draws FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view prize pools" 
ON public.prize_pools FOR SELECT 
USING (true);

-- -----------------------------------------------------------------------------
-- Policies for Draw Entries
-- -----------------------------------------------------------------------------
-- Users can view their own entries
CREATE POLICY "Users can view own entries" 
ON public.draw_entries FOR SELECT 
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Policies for Winners
-- -----------------------------------------------------------------------------
-- Anyone can view winners
CREATE POLICY "Anyone can view winners" 
ON public.winners FOR SELECT 
USING (true);

-- -----------------------------------------------------------------------------
-- Policies for Payments & Payouts
-- -----------------------------------------------------------------------------
-- Users can view their own payments
CREATE POLICY "Users can view own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = user_id);

-- Users can view their own payouts
CREATE POLICY "Users can view own payouts" 
ON public.payouts FOR SELECT 
USING (winner_id IN (SELECT id FROM public.winners WHERE user_id = auth.uid()));
