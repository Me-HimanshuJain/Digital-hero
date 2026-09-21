-- 0005_elevate_admin.sql

-- Replace 'YOUR_EMAIL@HERE.COM' with the email address you used to sign up for Digital Heroes!
-- Make sure to leave the single quotes around your email.
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
    SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@HERE.COM'
);

-- Note: You may need to log out and log back in to your dashboard for the new role to take effect in your session!
