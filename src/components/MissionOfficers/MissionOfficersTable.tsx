import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Download, User, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { MissionOfficer } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';

interface MissionOfficersTableProps {
  onAddClick: () => void;
  onEditClick: (officer: MissionOfficer) => void;
  refreshTrigger?: number;
  onReturn?: () => void;
}

export function MissionOfficersTable({ onAddClick, onEditClick, refreshTrigger, onReturn }: MissionOfficersTableProps) {
  const [officers, setOfficers] = useState<MissionOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOfficers();
  }, [refreshTrigger]);

  const loadOfficers = async () => {
    try {
      setLoading(true);
      const { data: officersData } = await supabase
        .from('mission_officers')
        .select('*')
        .order('employee_id');

      setOfficers(officersData || []);
    } catch (error) {
      console.error('Error loading mission officers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = officers.map((officer) => ({
      'Employee ID': officer.employee_id,
      'Full Name': officer.full_name,
      Email: officer.email || 'N/A',
      Phone: officer.phone || 'N/A',
      'Created At': new Date(officer.created_at).toLocaleString(),
    }));
    exportToExcel(exportData, 'Mission_Officers_Export', 'Mission_Officers');
  };

  const filteredOfficers = officers.filter((officer) => {
    const search = searchTerm.toLowerCase();
    return (
      officer.full_name.toLowerCase().includes(search) ||
      officer.employee_id.toLowerCase().includes(search) ||
      officer.email?.toLowerCase().includes(search) ||
      officer.phone?.toLowerCase().includes(search)
    );
  });

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
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <h2 className="text-xl md:text-2xl font-bold text-stone-900">Mission Officers</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none" size="sm">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={onAddClick} className="flex-1 sm:flex-none" size="sm">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Add Officer</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredOfficers.map((officer) => (
          <Card key={officer.id} hover onClick={() => onEditClick(officer)}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {officer.picture_url ? (
                  <img
                    src={officer.picture_url}
                    alt={officer.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center border-2 border-stone-200 flex-shrink-0">
                    <User size={28} className="text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-stone-900 truncate">{officer.full_name}</h3>
                  <p className="text-sm text-stone-500">ID: {officer.employee_id}</p>
                </div>
              </div>
              <div className="space-y-2">
                {officer.email && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Mail size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{officer.email}</span>
                  </div>
                )}
                {officer.phone && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Phone size={16} className="mr-2 flex-shrink-0" />
                    {officer.phone}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredOfficers.length === 0 && (
        <Card>
          <div className="text-center py-12 text-stone-500">
            {searchTerm
              ? 'No mission officers match your search criteria.'
              : 'No mission officers found. Click "Add Officer" to create your first mission officer.'}
          </div>
        </Card>
      )}
    </div>
  );
}
