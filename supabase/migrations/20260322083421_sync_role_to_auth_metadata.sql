/*
  # Sync role to auth user metadata

  1. Backfill existing users by copying role from public.users into auth.users raw_user_meta_data
  2. Create a trigger so any future update to public.users.role also updates auth metadata
*/

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', u.role)
FROM public.users u
WHERE auth.users.id = u.id
  AND u.role IS NOT NULL;

CREATE OR REPLACE FUNCTION sync_role_to_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_role_updated ON public.users;

CREATE TRIGGER on_user_role_updated
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_auth_metadata();
