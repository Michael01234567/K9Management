import { supabase } from '../lib/supabase';

export const ASSIGNMENT_ERROR_MESSAGE =
  'Assignment Rule Violated: A dog cannot have multiple handlers or multiple mission officers, and a handler can only have one mission-officer-assigned dog globally at the same time.';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateHandlerAssignment(
  handlerId: string | null,
  dogId?: string
): Promise<ValidationResult> {
  if (!handlerId) return { isValid: true };

  const { data, error } = await supabase
    .from('dog_handler')
    .select('dog_id')
    .eq('handler_id', handlerId)
    .neq('dog_id', dogId || '');

  if (error) {
    return { isValid: false, error: 'Failed to validate handler assignment.' };
  }

  if (data && data.length > 0) {
    return {
      isValid: false,
      error: 'This dog already has a different handler assigned globally.',
    };
  }

  return { isValid: true };
}

export async function validateOfficerAssignment(
  officerId: string | null,
  dogId?: string
): Promise<ValidationResult> {
  if (!officerId) return { isValid: true };

  const { data, error } = await supabase
    .from('dog_officer')
    .select('dog_id')
    .eq('officer_id', officerId)
    .neq('dog_id', dogId || '');

  if (error) {
    return { isValid: false, error: 'Failed to validate officer assignment.' };
  }

  if (data && data.length > 0) {
    return {
      isValid: false,
      error: 'This officer already has a different dog assigned globally.',
    };
  }

  return { isValid: true };
}

export async function validateHandlerOfficerCombination(
  handlerId: string | null,
  officerId: string | null,
  dogId?: string
): Promise<ValidationResult> {
  if (!handlerId || !officerId) return { isValid: true };

  const { data, error } = await supabase
    .from('dog_handler')
    .select(`
      dog_id,
      dogs!inner(
        id,
        name,
        dog_officer!inner(
          officer_id
        )
      )
    `)
    .eq('handler_id', handlerId)
    .neq('dog_id', dogId || '');

  if (error) {
    console.error('Validation error:', error);
    return { isValid: false, error: 'Failed to validate assignment rules.' };
  }

  if (data && data.length > 0) {
    return {
      isValid: false,
      error: ASSIGNMENT_ERROR_MESSAGE,
    };
  }

  return { isValid: true };
}

export async function getHandlerInfo(handlerId: string) {
  const { data: dogs } = await supabase
    .from('dog_handler')
    .select(`
      dog_id,
      dogs!inner(
        id,
        name,
        dog_officer(
          officer_id,
          mission_officers(full_name)
        )
      )
    `)
    .eq('handler_id', handlerId);

  return dogs || [];
}

export async function getOfficerInfo(officerId: string) {
  const { data: assignment } = await supabase
    .from('dog_officer')
    .select(`
      dog_id,
      dogs(name)
    `)
    .eq('officer_id', officerId)
    .maybeSingle();

  return assignment;
}
