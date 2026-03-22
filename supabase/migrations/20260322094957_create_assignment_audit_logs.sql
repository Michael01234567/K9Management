/*
  # Create Assignment Audit Logs Table

  ## Purpose
  Track all dog assignment changes (handler and mission officer) with full before/after context.

  ## New Tables
  - `assignment_audit_logs`
    - `id` (uuid, primary key)
    - `created_at` (timestamptz) — when the event occurred
    - `action` (text) — one of: ASSIGN_HANDLER, REASSIGN_HANDLER, REMOVE_HANDLER,
                                 ASSIGN_OFFICER, REASSIGN_OFFICER, REMOVE_OFFICER
    - `dog_id` (uuid, FK → dogs.id on delete set null) — the dog being reassigned
    - `dog_name` (text) — snapshot of dog name at time of change
    - `old_handler_id` (uuid, nullable) — previous handler
    - `old_handler_name` (text, nullable) — snapshot of previous handler name
    - `new_handler_id` (uuid, nullable) — new handler
    - `new_handler_name` (text, nullable) — snapshot of new handler name
    - `old_officer_id` (uuid, nullable) — previous officer
    - `old_officer_name` (text, nullable) — snapshot of previous officer name
    - `new_officer_id` (uuid, nullable) — new officer
    - `new_officer_name` (text, nullable) — snapshot of new officer name
    - `changed_by` (uuid, FK → auth.users.id on delete set null) — who made the change
    - `notes` (text, nullable) — optional source or context

  ## Security
  - RLS enabled
  - Authenticated users may insert their own log rows
  - Authenticated users may read all log rows (audit trail is readable)
  - No update or delete allowed (immutable audit log)

  ## Notes
  - Name fields are stored as snapshots so the log remains accurate even if names change later
  - dog_id uses ON DELETE SET NULL to preserve the log row even if the dog is deleted
*/

CREATE TABLE IF NOT EXISTS assignment_audit_logs (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  action           text        NOT NULL,
  dog_id           uuid        REFERENCES dogs(id) ON DELETE SET NULL,
  dog_name         text        NOT NULL DEFAULT '',
  old_handler_id   uuid,
  old_handler_name text,
  new_handler_id   uuid,
  new_handler_name text,
  old_officer_id   uuid,
  old_officer_name text,
  new_officer_id   uuid,
  new_officer_name text,
  changed_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes            text,

  CONSTRAINT action_valid CHECK (
    action IN (
      'ASSIGN_HANDLER',
      'REASSIGN_HANDLER',
      'REMOVE_HANDLER',
      'ASSIGN_OFFICER',
      'REASSIGN_OFFICER',
      'REMOVE_OFFICER'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_dog_id     ON assignment_audit_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON assignment_audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON assignment_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON assignment_audit_logs(action);

ALTER TABLE assignment_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert audit logs"
  ON assignment_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = changed_by);

CREATE POLICY "Authenticated users can read audit logs"
  ON assignment_audit_logs
  FOR SELECT
  TO authenticated
  USING (true);
