export interface Dog {
  id: string;
  name: string;
  breed: string;
  sex: string;
  microchip_number: string | null;
  dob: string;
  training_level: string;
  specialization: string | null;
  location: string | null;
  origin: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Handler {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DogHandler {
  id: string;
  dog_id: string;
  handler_id: string;
  assigned_at: string;
}

export interface VetRecord {
  id: string;
  dog_id: string;
  visit_date: string;
  visit_type: string;
  notes: string | null;
  next_visit_date: string | null;
  created_at: string;
}

export interface FitnessLog {
  id: string;
  dog_id: string;
  log_date: string;
  activity_type: string;
  duration_minutes: number | null;
  distance_km: number | null;
  weight_kg: number | null;
  notes: string | null;
  created_at: string;
}

export interface FitnessStatus {
  id: string;
  dog_id: string;
  handler_id: string | null;
  weight_kg: number | null;
  status: string;
  duration_start: string | null;
  duration_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FitnessStatusWithDetails extends FitnessStatus {
  dog?: Dog;
  handler?: Handler;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface DogWithHandlers extends Dog {
  handlers?: Handler[];
  fitness_status?: string | null;
}

export const USER_ROLES = [
  'Admin',
  'Handler',
  'Veterinarian',
  'Viewer',
] as const;

export const TRAINING_LEVELS = [
  'Phase 1',
  'Phase 2',
  'Phase 3',
  'Phase 4',
  'Operational',
] as const;

export const SEX_OPTIONS = ['Male', 'Female'] as const;

export const VET_VISIT_TYPES = [
  'Checkup',
  'Vaccination',
  'Surgery',
  'Emergency',
  'Dental',
  'Other',
] as const;

export const ACTIVITY_TYPES = [
  'Walk',
  'Run',
  'Training Session',
  'Agility',
  'Search & Rescue',
  'Rest Day',
] as const;

export const SPECIALIZATION_TYPES = [
  'Explosive',
  'Narcotic',
  'Tobacco',
  'RAS Cargo',
  'Currency',
  'Kong',
] as const;

export const FITNESS_STATUS_OPTIONS = [
  'Fit',
  'Training Only',
  'Sick',
  'Estrus',
  'After Care',
] as const;
