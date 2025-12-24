import { useEffect, useState } from 'react';
import { Search, Plus, MapPin, Download, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Card } from '../UI/Card';
import { FitnessStatusBadge } from '../UI/FitnessStatusBadge';
import { supabase } from '../../lib/supabase';
import { Dog, Handler, MissionOfficer, TRAINING_LEVELS } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';

interface DogWithHandlers extends Dog {
  handlers?: Handler[];
  officers?: MissionOfficer[];
  fitness_status?: string | null;
}

interface DogTableProps {
  onDogClick: (dog: DogWithHandlers) => void;
  onAddClick: () => void;
  refreshTrigger?: number;
  onReturn?: () => void;
}

export function DogTable({ onDogClick, onAddClick, refreshTrigger, onReturn }: DogTableProps) {
  const [dogs, setDogs] = useState<DogWithHandlers[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<DogWithHandlers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [trainingFilter, setTrainingFilter] = useState('all');
  const [breedFilter, setBreedFilter] = useState('all');
  const [sexFilter, setSexFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'breed'>('name');

  useEffect(() => {
    loadDogs();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAndSortDogs();
  }, [dogs, searchTerm, trainingFilter, breedFilter, sexFilter, specializationFilter, sortBy]);

  const loadDogs = async () => {
    try {
      setLoading(true);
      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('*')
        .order('name');

      if (dogsError) throw dogsError;

      const dogsWithHandlers = await Promise.all(
        (dogsData || []).map(async (dog) => {
          const { data: dogHandlers } = await supabase
            .from('dog_handler')
            .select('handler_id')
            .eq('dog_id', dog.id);

          const { data: dogOfficers } = await supabase
            .from('dog_officer')
            .select('officer_id')
            .eq('dog_id', dog.id);

          const handlerIds = dogHandlers?.map((dh) => dh.handler_id) || [];
          const officerIds = dogOfficers?.map((dh) => dh.officer_id) || [];

          const { data: fitnessData } = await supabase
            .from('fitness_status')
            .select('status')
            .eq('dog_id', dog.id)
            .maybeSingle();

          let handlers: Handler[] = [];
          let officers: MissionOfficer[] = [];

          if (handlerIds.length > 0) {
            const { data: handlersData } = await supabase
              .from('handlers')
              .select('*')
              .in('id', handlerIds);
            handlers = handlersData || [];
          }

          if (officerIds.length > 0) {
            const { data: officersData } = await supabase
              .from('mission_officers')
              .select('*')
              .in('id', officerIds);
            officers = officersData || [];
          }

          return { ...dog, handlers, officers, fitness_status: fitnessData?.status || null };
        })
      );

      setDogs(dogsWithHandlers);
    } catch (error) {
      console.error('Error loading dogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDogs = () => {
    let result = [...dogs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (dog) =>
          dog.name.toLowerCase().includes(search) ||
          dog.breed.toLowerCase().includes(search) ||
          dog.microchip_number?.toLowerCase().includes(search) ||
          dog.handlers?.some((h) => h.full_name.toLowerCase().includes(search))
      );
    }

    if (trainingFilter !== 'all') {
      result = result.filter((dog) => dog.training_level === trainingFilter);
    }

    if (breedFilter !== 'all') {
      result = result.filter((dog) => dog.breed === breedFilter);
    }

    if (sexFilter !== 'all') {
      result = result.filter((dog) => dog.sex === sexFilter);
    }

    if (specializationFilter !== 'all') {
      if (specializationFilter === 'none') {
        result = result.filter((dog) => !dog.specialization);
      } else {
        result = result.filter((dog) => dog.specialization === specializationFilter);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'age') {
        return new Date(a.dob).getTime() - new Date(b.dob).getTime();
      } else if (sortBy === 'breed') {
        return a.breed.localeCompare(b.breed);
      }
      return 0;
    });

    setFilteredDogs(result);
  };

  const getUniqueBreeds = () => {
    const breeds = [...new Set(dogs.map((dog) => dog.breed))].sort();
    return breeds;
  };

  const getUniqueSpecializations = (): string[] => {
    const specializations = [...new Set(dogs.map((dog) => dog.specialization).filter((spec): spec is string => !!spec))].sort();
    return specializations;
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  };

  const handleExport = () => {
    const exportData = filteredDogs.map((dog) => ({
      Name: dog.name,
      Age: calculateAge(dog.dob),
      Breed: dog.breed,
      Sex: dog.sex,
      'Microchip Number': dog.microchip_number || 'N/A',
      'Training Level': dog.training_level,
      Specialization: dog.specialization || 'N/A',
      'Fitness Status': dog.fitness_status || 'N/A',
      Handlers: dog.handlers && dog.handlers.length > 0 ? dog.handlers.map((h) => h.full_name).join(', ') : 'None',
      Officers: dog.officers && dog.officers.length > 0 ? dog.officers.map((o) => o.full_name).join(', ') : 'None',
      Location: dog.location || 'N/A',
      Origin: dog.origin || 'N/A',
      Note: dog.note || 'N/A',
    }));
    exportToExcel(exportData, 'Dogs_Export', 'Dogs');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {onReturn && (
        <Button onClick={onReturn} variant="outline" size="sm" className="w-fit lg:hidden">
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Button>
      )}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
            <Input
              type="text"
              placeholder="Search dogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 sm:flex-none sm:w-36">
              <Select
                value={trainingFilter}
                onChange={(e) => setTrainingFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Levels' },
                  ...TRAINING_LEVELS.map((level) => ({ value: level, label: level })),
                ]}
              />
            </div>
            <div className="flex-1 sm:flex-none sm:w-36">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'breed')}
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'age', label: 'Age' },
                  { value: 'breed', label: 'Breed' },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[140px] sm:flex-none sm:w-40">
            <Select
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Breeds' },
                ...getUniqueBreeds().map((breed) => ({ value: breed, label: breed })),
              ]}
            />
          </div>
          <div className="flex-1 min-w-[140px] sm:flex-none sm:w-40">
            <Select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Sexes' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
            />
          </div>
          <div className="flex-1 min-w-[140px] sm:flex-none sm:w-44">
            <Select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Specializations' },
                { value: 'none', label: 'No Specialization' },
                ...getUniqueSpecializations().map((spec) => ({ value: spec, label: spec })),
              ]}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none" size="sm">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={onAddClick} className="flex-1 sm:flex-none" size="sm">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Add Dog</span>
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Breed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Sex</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Training Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Specialization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Fitness Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Handlers/Officers</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredDogs.map((dog) => (
                  <tr
                    key={dog.id}
                    onClick={() => onDogClick(dog)}
                    className="hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{dog.name}</div>
                      {dog.microchip_number && (
                        <div className="text-xs text-stone-500">{dog.microchip_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-700">{calculateAge(dog.dob)}</td>
                    <td className="px-6 py-4 text-stone-700">{dog.breed}</td>
                    <td className="px-6 py-4 text-stone-700">{dog.sex}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                        {dog.training_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dog.specialization ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                          {dog.specialization}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <FitnessStatusBadge status={dog.fitness_status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-700 space-y-1">
                        {dog.handlers && dog.handlers.length > 0 && (
                          <div>
                            <span className="font-medium text-xs text-stone-500">Handlers: </span>
                            {dog.handlers.map((h) => h.full_name).join(', ')}
                          </div>
                        )}
                        {dog.officers && dog.officers.length > 0 && (
                          <div>
                            <span className="font-medium text-xs text-stone-500">Officers: </span>
                            {dog.officers.map((o) => o.full_name).join(', ')}
                          </div>
                        )}
                        {(!dog.handlers || dog.handlers.length === 0) && (!dog.officers || dog.officers.length === 0) && (
                          <span className="text-stone-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {dog.location ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dog.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center text-amber-900 hover:text-amber-700"
                        >
                          <MapPin size={16} className="mr-1" />
                          <span className="text-sm">{dog.location}</span>
                        </a>
                      ) : (
                        <span className="text-stone-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDogs.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                No dogs found. Click "Add Dog" to create your first entry.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {filteredDogs.map((dog) => (
          <Card key={dog.id} hover onClick={() => onDogClick(dog)}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 text-lg truncate">{dog.name}</h3>
                  <p className="text-sm text-stone-600">{dog.breed} • {dog.sex}</p>
                  {dog.microchip_number && (
                    <p className="text-xs text-stone-500 mt-1">{dog.microchip_number}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-sm font-medium text-stone-900">{calculateAge(dog.dob)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                  {dog.training_level}
                </span>
                {dog.specialization && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                    {dog.specialization}
                  </span>
                )}
                <FitnessStatusBadge status={dog.fitness_status} size="sm" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="text-stone-700">
                  <div className="flex items-start">
                    <Users size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      {dog.handlers && dog.handlers.length > 0 && (
                        <div>
                          <span className="font-medium text-xs text-stone-500">Handlers: </span>
                          <span className="text-sm">{dog.handlers.map((h) => h.full_name).join(', ')}</span>
                        </div>
                      )}
                      {dog.officers && dog.officers.length > 0 && (
                        <div>
                          <span className="font-medium text-xs text-stone-500">Officers: </span>
                          <span className="text-sm">{dog.officers.map((o) => o.full_name).join(', ')}</span>
                        </div>
                      )}
                      {(!dog.handlers || dog.handlers.length === 0) && (!dog.officers || dog.officers.length === 0) && (
                        <span className="text-stone-400">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
                {dog.location && (
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2 flex-shrink-0 text-amber-900" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dog.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-amber-900 hover:text-amber-700 truncate"
                    >
                      {dog.location}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filteredDogs.length === 0 && (
          <Card>
            <div className="text-center py-12 text-stone-500">
              No dogs found. Click "Add Dog" to create your first entry.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
