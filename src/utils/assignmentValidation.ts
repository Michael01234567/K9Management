import { supabase } from '../lib/supabase';

export type AssignmentField = 'handler' | 'officer';

export interface FieldValidationResult {
  isValid: boolean;
  field?: AssignmentField;
  error?: string;
}

export interface AssignmentValidationState {
  handlerError: string;
  officerError: string;
}

export const EMPTY_VALIDATION: AssignmentValidationState = {
  handlerError: '',
  officerError: '',
};

/**
 * Rule 1: One dog → one handler globally
 * Check that no OTHER dog already has this handler.
 */
export async function checkDogHandlerUniqueness(
  handlerId: string,
  currentDogId?: string
): Promise<FieldValidationResult> {
  const query = supabase
    .from('dog_handler')
    .select('dog_id')
    .eq('handler_id', handlerId);

  const { data, error } = currentDogId
    ? await query.neq('dog_id', currentDogId)
    : await query;

  if (error) return { isValid: false, field: 'handler', error: 'Unable to validate handler assignment.' };

  if (data && data.length > 0) {
    return {
      isValid: false,
      field: 'handler',
      error: 'This dog is already assigned to another handler.',
    };
  }

  return { isValid: true };
}

/**
 * Rule 2: One dog → one officer globally
 * Rule 3: One officer → one dog globally
 * Check that no OTHER dog already has this officer.
 */
export async function checkDogOfficerUniqueness(
  officerId: string,
  currentDogId?: string
): Promise<FieldValidationResult> {
  const query = supabase
    .from('dog_officer')
    .select('dog_id')
    .eq('officer_id', officerId);

  const { data, error } = currentDogId
    ? await query.neq('dog_id', currentDogId)
    : await query;

  if (error) return { isValid: false, field: 'officer', error: 'Unable to validate officer assignment.' };

  if (data && data.length > 0) {
    return {
      isValid: false,
      field: 'officer',
      error: 'This officer already has a dog assigned.',
    };
  }

  return { isValid: true };
}

/**
 * Rule 4: One handler may have multiple dogs, but only ONE of those dogs
 * may have a mission officer assigned globally.
 * Validates when BOTH handler and officer are selected.
 */
export async function checkHandlerOfficerCombination(
  handlerId: string,
  officerId: string,
  currentDogId?: string
): Promise<FieldValidationResult> {
  const query = supabase
    .from('dog_handler')
    .select(`
      dog_id,
      dogs!inner(
        id,
        dog_officer!inner(officer_id)
      )
    `)
    .eq('handler_id', handlerId);

  const { data, error } = currentDogId
    ? await query.neq('dog_id', currentDogId)
    : await query;

  if (error) return { isValid: false, field: 'handler', error: 'Unable to validate handler assignment rules.' };

  if (data && data.length > 0) {
    return {
      isValid: false,
      field: 'handler',
      error: 'This handler already has another dog with a mission officer assigned.',
    };
  }

  void officerId;
  return { isValid: true };
}

/**
 * Run all relevant assignment validations for a given combination of
 * handlerId + officerId + currentDogId.
 * Returns an AssignmentValidationState with per-field error strings.
 */
export async function validateAllAssignments(
  handlerId: string,
  officerId: string,
  currentDogId?: string
): Promise<AssignmentValidationState> {
  const state: AssignmentValidationState = { handlerError: '', officerError: '' };

  const checks = await Promise.all([
    handlerId ? checkDogHandlerUniqueness(handlerId, currentDogId) : Promise.resolve({ isValid: true }),
    officerId ? checkDogOfficerUniqueness(officerId, currentDogId) : Promise.resolve({ isValid: true }),
    handlerId && officerId
      ? checkHandlerOfficerCombination(handlerId, officerId, currentDogId)
      : Promise.resolve({ isValid: true }),
  ]);

  for (const result of checks) {
    if (!result.isValid && result.error) {
      if (result.field === 'officer') {
        if (!state.officerError) state.officerError = result.error;
      } else {
        if (!state.handlerError) state.handlerError = result.error;
      }
    }
  }

  return state;
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
