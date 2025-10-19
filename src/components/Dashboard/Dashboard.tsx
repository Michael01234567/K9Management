import { useEffect, useState } from 'react';
import { Dog, Users, Calendar, Activity } from 'lucide-react';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalDogs: number;
  activeHandlers: number;
  upcomingVetVisits: number;
  recentFitnessLogs: number;
  dogsByTrainingLevel: Record<string, number>;
  dogsByBreed: Record<string, number>;
  dogsBySpecialization: Record<string, number>;
  dogsByLocation: Record<string, number>;
  dogsByLocationAndSpecialization: Record<string, Record<string, number>>;
  dogsByOrigin: Record<string, number>;
  dogsByOriginAndSpecialization: Record<string, Record<string, number>>;
}

export function Dashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDogs: 0,
    activeHandlers: 0,
    upcomingVetVisits: 0,
    recentFitnessLogs: 0,
    dogsByTrainingLevel: {},
    dogsByBreed: {},
    dogsBySpecialization: {},
    dogsByLocation: {},
    dogsByLocationAndSpecialization: {},
    dogsByOrigin: {},
    dogsByOriginAndSpecialization: {},
  });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: dogs } = await supabase.from('dogs').select('*');
      const { data: handlers } = await supabase.from('handlers').select('id');
      const { data: vetRecords } = await supabase
        .from('vet_records')
        .select('*')
        .gte('next_visit_date', new Date().toISOString().split('T')[0])
        .lte('next_visit_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: fitnessLogs } = await supabase
        .from('fitness_logs')
        .select('*')
        .gte('log_date', thirtyDaysAgo);

      const { data: fitnessStatus } = await supabase
        .from('fitness_status')
        .select('*');

      const trainingLevelCounts: Record<string, number> = {};
      const breedCounts: Record<string, number> = {};
      const specializationCounts: Record<string, number> = {};
      const locationCounts: Record<string, number> = {};
      const locationSpecializationCounts: Record<string, Record<string, number>> = {};
      const originCounts: Record<string, number> = {};
      const originSpecializationCounts: Record<string, Record<string, number>> = {};

      dogs?.forEach((dog) => {
        trainingLevelCounts[dog.training_level] = (trainingLevelCounts[dog.training_level] || 0) + 1;
        breedCounts[dog.breed] = (breedCounts[dog.breed] || 0) + 1;

        if (dog.specialization) {
          specializationCounts[dog.specialization] = (specializationCounts[dog.specialization] || 0) + 1;
        }

        if (dog.location) {
          locationCounts[dog.location] = (locationCounts[dog.location] || 0) + 1;

          if (!locationSpecializationCounts[dog.location]) {
            locationSpecializationCounts[dog.location] = {};
          }

          if (dog.specialization) {
            locationSpecializationCounts[dog.location][dog.specialization] =
              (locationSpecializationCounts[dog.location][dog.specialization] || 0) + 1;
          }
        }

        if (dog.origin) {
          originCounts[dog.origin] = (originCounts[dog.origin] || 0) + 1;

          if (!originSpecializationCounts[dog.origin]) {
            originSpecializationCounts[dog.origin] = {};
          }

          if (dog.specialization) {
            originSpecializationCounts[dog.origin][dog.specialization] =
              (originSpecializationCounts[dog.origin][dog.specialization] || 0) + 1;
          }
        }
      });

      const totalFitnessRecords = (fitnessLogs?.length || 0) + (fitnessStatus?.length || 0);

      setStats({
        totalDogs: dogs?.length || 0,
        activeHandlers: handlers?.length || 0,
        upcomingVetVisits: vetRecords?.length || 0,
        recentFitnessLogs: totalFitnessRecords,
        dogsByTrainingLevel: trainingLevelCounts,
        dogsByBreed: breedCounts,
        dogsBySpecialization: specializationCounts,
        dogsByLocation: locationCounts,
        dogsByLocationAndSpecialization: locationSpecializationCounts,
        dogsByOrigin: originCounts,
        dogsByOriginAndSpecialization: originSpecializationCounts,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Dogs',
      value: stats.totalDogs,
      icon: Dog,
      color: 'bg-amber-100 text-amber-900',
      onClick: () => onNavigate('dogs'),
    },
    {
      title: 'Active Handlers',
      value: stats.activeHandlers,
      icon: Users,
      color: 'bg-stone-100 text-stone-900',
      onClick: () => onNavigate('handlers'),
    },
    {
      title: 'Vet Visits Due (30d)',
      value: stats.upcomingVetVisits,
      icon: Calendar,
      color: 'bg-red-100 text-red-900',
      onClick: () => onNavigate('vet'),
    },
    {
      title: 'Fitness Records',
      value: stats.recentFitnessLogs,
      icon: Activity,
      color: 'bg-green-100 text-green-900',
      onClick: () => onNavigate('fitness'),
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card) => (
          <Card key={card.title} hover onClick={card.onClick}>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-lg ${card.color}`}>
                  <card.icon size={20} className="md:w-6 md:h-6" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">{card.value}</div>
              <div className="text-xs md:text-sm text-stone-600">{card.title}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 md:mb-4">Dogs by Training Level</h3>
            <div className="space-y-3">
              {Object.entries(stats.dogsByTrainingLevel).map(([level, count]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700">{level}</span>
                    <span className="font-semibold text-stone-900">{count}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-amber-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / stats.totalDogs) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 md:mb-4">Dogs by Breed</h3>
            <div className="space-y-3">
              {Object.entries(stats.dogsByBreed)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([breed, count]) => (
                  <div key={breed}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-700">{breed}</span>
                      <span className="font-semibold text-stone-900">{count}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="bg-stone-700 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / stats.totalDogs) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 md:mb-4">Dogs by Specialization</h3>
            <div className="space-y-3">
              {Object.entries(stats.dogsBySpecialization).length > 0 ? (
                Object.entries(stats.dogsBySpecialization)
                  .sort((a, b) => b[1] - a[1])
                  .map(([specialization, count]) => (
                    <div key={specialization}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-700">{specialization}</span>
                        <span className="font-semibold text-stone-900">{count}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-blue-900 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / stats.totalDogs) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-stone-500 text-sm">No specializations assigned yet</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 md:mb-4">Dogs by Location</h3>
            <div className="space-y-3">
              {Object.entries(stats.dogsByLocation).length > 0 ? (
                Object.entries(stats.dogsByLocation)
                  .sort((a, b) => b[1] - a[1])
                  .map(([location, count]) => (
                    <div
                      key={location}
                      className="cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedLocation(selectedLocation === location ? null : location)}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-700 font-medium">{location}</span>
                        <span className="font-semibold text-stone-900">{count}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-green-900 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / stats.totalDogs) * 100}%` }}
                        ></div>
                      </div>
                      {selectedLocation === location && stats.dogsByLocationAndSpecialization[location] && (
                        <div className="mt-3 pl-4 space-y-2">
                          <p className="text-xs font-semibold text-stone-600 mb-2">Specializations at {location}:</p>
                          {Object.entries(stats.dogsByLocationAndSpecialization[location]).map(
                            ([spec, specCount]) => (
                              <div key={spec} className="flex justify-between text-xs">
                                <span className="text-stone-600">{spec}</span>
                                <span className="font-medium text-blue-900">{specCount}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-stone-500 text-sm">No locations assigned yet</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-3 md:mb-4">Dogs by Origin</h3>
            <div className="space-y-3">
              {Object.entries(stats.dogsByOrigin).length > 0 ? (
                Object.entries(stats.dogsByOrigin)
                  .sort((a, b) => b[1] - a[1])
                  .map(([origin, count]) => (
                    <div
                      key={origin}
                      className="cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedOrigin(selectedOrigin === origin ? null : origin)}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-stone-700 font-medium">{origin}</span>
                        <span className="font-semibold text-stone-900">{count}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-orange-900 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / stats.totalDogs) * 100}%` }}
                        ></div>
                      </div>
                      {selectedOrigin === origin && stats.dogsByOriginAndSpecialization[origin] && (
                        <div className="mt-3 pl-4 space-y-2">
                          <p className="text-xs font-semibold text-stone-600 mb-2">Specializations from {origin}:</p>
                          {Object.entries(stats.dogsByOriginAndSpecialization[origin]).map(
                            ([spec, specCount]) => (
                              <div key={spec} className="flex justify-between text-xs">
                                <span className="text-stone-600">{spec}</span>
                                <span className="font-medium text-blue-900">{specCount}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-stone-500 text-sm">No origins assigned yet</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
