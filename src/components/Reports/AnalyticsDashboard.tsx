import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../UI/Card';

interface Mission {
  id: string;
  name: string;
  status: string;
  date: string;
  location?: string;
  handler_count?: number;
  dog_count?: number;
  officer_name?: string;
}

interface AnalyticsDashboardProps {
  missions: Mission[];
}

const STATUS_COLORS = {
  Planning: '#f59e0b',
  Active: '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#ef4444',
};

export function AnalyticsDashboard({ missions }: AnalyticsDashboardProps) {
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === 'Completed').length;
  const activeMissions = missions.filter(m => m.status === 'Active').length;
  const cancelledMissions = missions.filter(m => m.status === 'Cancelled').length;
  const planningMissions = missions.filter(m => m.status === 'Planning').length;

  const totalHandlers = missions.reduce((sum, m) => sum + (m.handler_count || 0), 0);
  const totalDogs = missions.reduce((sum, m) => sum + (m.dog_count || 0), 0);
  const uniqueOfficers = new Set(missions.map(m => m.officer_name).filter(Boolean)).size;

  const statusData = [
    { name: 'Planning', value: planningMissions, color: STATUS_COLORS.Planning },
    { name: 'Active', value: activeMissions, color: STATUS_COLORS.Active },
    { name: 'Completed', value: completedMissions, color: STATUS_COLORS.Completed },
    { name: 'Cancelled', value: cancelledMissions, color: STATUS_COLORS.Cancelled },
  ].filter(item => item.value > 0);

  const locationData = missions.reduce((acc: Record<string, number>, mission) => {
    const loc = mission.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const locationChartData = Object.entries(locationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const missionsByMonth = missions.reduce((acc: Record<string, number>, mission) => {
    const date = new Date(mission.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(missionsByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Total Missions</h3>
          <p className="text-3xl font-bold text-stone-900">{totalMissions}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedMissions}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Active</h3>
          <p className="text-3xl font-bold text-blue-600">{activeMissions}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Cancelled</h3>
          <p className="text-3xl font-bold text-red-600">{cancelledMissions}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Total K9 Teams</h3>
          <p className="text-3xl font-bold text-stone-900">{totalDogs}</p>
          <p className="text-xs text-stone-500 mt-1">Dogs Deployed</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Handlers Involved</h3>
          <p className="text-3xl font-bold text-stone-900">{totalHandlers}</p>
          <p className="text-xs text-stone-500 mt-1">Total Assignments</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Mission Officers</h3>
          <p className="text-3xl font-bold text-stone-900">{uniqueOfficers}</p>
          <p className="text-xs text-stone-500 mt-1">Unique Officers</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Missions by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-stone-500">
              No mission data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Top Locations</h3>
          {locationChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-stone-500">
              No location data available
            </div>
          )}
        </Card>
      </div>

      {trendData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Mission Trend (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Missions" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
