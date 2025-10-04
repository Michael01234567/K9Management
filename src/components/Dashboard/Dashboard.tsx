import { useEffect, useState } from 'react';
import { Dog, Users, Calendar, Activity } from 'lucide-react';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalDogs: number;
  activeDogs: number;
  upcomingVetVisits: number;
  recentFitnessLogs: number;
  dogsByTrainingLevel: Record<string, number>;
  dogsByBreed: Record<string, number>;
}

export function Dashboard({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDogs: 0,
    activeDogs: 0,
    upcomingVetVisits: 0,
    recentFitnessLogs: 0,
    dogsByTrainingLevel: {},
    dogsByBreed: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: dogs } = await supabase.from('dogs').select('*');
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

      const trainingLevelCounts: Record<string, number> = {};
      const breedCounts: Record<string, number> = {};

      dogs?.forEach((dog) => {
        trainingLevelCounts[dog.training_level] = (trainingLevelCounts[dog.training_level] || 0) + 1;
        breedCounts[dog.breed] = (breedCounts[dog.breed] || 0) + 1;
      });

      setStats({
        totalDogs: dogs?.length || 0,
        activeDogs: dogs?.length || 0,
        upcomingVetVisits: vetRecords?.length || 0,
        recentFitnessLogs: fitnessLogs?.length || 0,
        dogsByTrainingLevel: trainingLevelCounts,
        dogsByBreed: breedCounts,
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
      value: stats.activeDogs,
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
      title: 'Fitness Logs (30d)',
      value: stats.recentFitnessLogs,
      icon: Activity,
      color: 'bg-green-100 text-green-900',
      onClick: () => onNavigate('fitness'),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} hover onClick={card.onClick}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-stone-900 mb-1">{card.value}</div>
              <div className="text-sm text-stone-600">{card.title}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Dogs by Training Level</h3>
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
          <div className="p-6">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Dogs by Breed</h3>
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
      </div>
    </div>
  );
}
