import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type UserRole = 'Admin' | 'Handler' | 'Veterinarian' | 'Viewer';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('Viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole('Viewer');
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('Viewer');
        } else if (data) {
          setRole(data.role as UserRole);
        } else {
          setRole('Viewer');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('Viewer');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const canView = () => true;

  const canCreate = (resource: 'dogs' | 'handlers' | 'vet_records' | 'fitness_logs') => {
    if (resource === 'dogs' || resource === 'handlers') {
      return role === 'Admin';
    }
    return ['Admin', 'Handler', 'Veterinarian'].includes(role);
  };

  const canEdit = (resource: 'dogs' | 'handlers' | 'vet_records' | 'fitness_logs') => {
    if (resource === 'dogs' || resource === 'handlers') {
      return role === 'Admin';
    }
    return ['Admin', 'Handler', 'Veterinarian'].includes(role);
  };

  const canDelete = (resource: 'dogs' | 'handlers' | 'vet_records' | 'fitness_logs') => {
    if (resource === 'vet_records') {
      return role === 'Admin' || role === 'Veterinarian';
    }
    return role === 'Admin';
  };

  const isAdmin = () => role === 'Admin';
  const isHandler = () => role === 'Handler';
  const isVeterinarian = () => role === 'Veterinarian';
  const isViewer = () => role === 'Viewer';

  return {
    role,
    loading,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isHandler,
    isVeterinarian,
    isViewer,
  };
}
