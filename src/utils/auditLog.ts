import { supabase } from '../lib/supabase';

export type AuditAction =
  | 'ASSIGN_HANDLER'
  | 'REASSIGN_HANDLER'
  | 'REMOVE_HANDLER'
  | 'ASSIGN_OFFICER'
  | 'REASSIGN_OFFICER'
  | 'REMOVE_OFFICER';

export interface AssignmentSnapshot {
  handlerId: string;
  handlerName: string;
  officerId: string;
  officerName: string;
}

export interface AuditLogEntry {
  action: AuditAction;
  dog_id: string;
  dog_name: string;
  old_handler_id?: string | null;
  old_handler_name?: string | null;
  new_handler_id?: string | null;
  new_handler_name?: string | null;
  old_officer_id?: string | null;
  old_officer_name?: string | null;
  new_officer_id?: string | null;
  new_officer_name?: string | null;
  changed_by: string;
  notes?: string | null;
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function writeLog(entry: AuditLogEntry): Promise<void> {
  const { error } = await supabase.from('assignment_audit_logs').insert(entry);
  if (error) {
    console.error('[AuditLog] Failed to write audit log:', error.message);
  }
}

/**
 * Determines which assignment-related audit events need to be logged
 * by comparing old vs new snapshots, then writes them in a single batch.
 *
 * Only logs when something actually changed. No-ops when nothing differs.
 */
export async function logAssignmentChanges(params: {
  dogId: string;
  dogName: string;
  before: AssignmentSnapshot;
  after: AssignmentSnapshot;
}): Promise<void> {
  const { dogId, dogName, before, after } = params;

  const userId = await getCurrentUserId();
  if (!userId) return;

  const handlerChanged = before.handlerId !== after.handlerId;
  const officerChanged = before.officerId !== after.officerId;

  if (!handlerChanged && !officerChanged) return;

  const entries: AuditLogEntry[] = [];

  if (handlerChanged) {
    let action: AuditAction;
    if (!before.handlerId && after.handlerId) {
      action = 'ASSIGN_HANDLER';
    } else if (before.handlerId && !after.handlerId) {
      action = 'REMOVE_HANDLER';
    } else {
      action = 'REASSIGN_HANDLER';
    }

    entries.push({
      action,
      dog_id: dogId,
      dog_name: dogName,
      old_handler_id: before.handlerId || null,
      old_handler_name: before.handlerName || null,
      new_handler_id: after.handlerId || null,
      new_handler_name: after.handlerName || null,
      changed_by: userId,
    });
  }

  if (officerChanged) {
    let action: AuditAction;
    if (!before.officerId && after.officerId) {
      action = 'ASSIGN_OFFICER';
    } else if (before.officerId && !after.officerId) {
      action = 'REMOVE_OFFICER';
    } else {
      action = 'REASSIGN_OFFICER';
    }

    entries.push({
      action,
      dog_id: dogId,
      dog_name: dogName,
      old_officer_id: before.officerId || null,
      old_officer_name: before.officerName || null,
      new_officer_id: after.officerId || null,
      new_officer_name: after.officerName || null,
      changed_by: userId,
    });
  }

  await Promise.all(entries.map(writeLog));
}
