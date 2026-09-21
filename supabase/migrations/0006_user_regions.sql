-- 0006_user_regions.sql

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'UK';

-- Update the handle_new_user trigger to include region
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, region)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'subscriber',
    COALESCE(new.raw_user_meta_data->>'region', 'UK')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
