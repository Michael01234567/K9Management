
/*
  # Create Admin User

  Creates the admin user in both auth.users and public.users tables.

  1. Auth User
    - Creates user in auth.users with email/password credentials
    - Email: michaelchamberlain501@gmail.com

  2. Public User Record
    - Creates corresponding record in public.users with Admin role
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'michaelchamberlain501@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'michaelchamberlain501@gmail.com',
      crypt('me123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Michael Chamberlain"}',
      'authenticated',
      'authenticated',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      'michaelchamberlain501@gmail.com',
      jsonb_build_object('sub', new_user_id::text, 'email', 'michaelchamberlain501@gmail.com'),
      'email',
      now(),
      now(),
      now()
    );

    INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
    VALUES (new_user_id, 'michaelchamberlain501@gmail.com', 'Michael Chamberlain', 'Admin', now(), now())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
