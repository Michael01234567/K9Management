import { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { Button } from '../UI/Button';
import { exportMissionsToPDF } from '../../utils/pdfExport';
import { formatDate } from '../../utils/dateFormat';
import * as XLSX from 'xlsx';

interface MissionReport {
  id: string;
  name: string;
  status: string;
  location: string;
  date: string;
  officer_name: string;
  handler_names: string[];
  dog_names: string[];
  notes: string;
}

interface MissionReportsTableProps {
  missions: MissionReport[];
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    location?: string;
    status?: string;
  };
}

export function MissionReportsTable({ missions, filters }: MissionReportsTableProps) {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const handleExportExcel = () => {
    const exportData = missions.map(mission => ({
      'Mission Name': mission.name,
      'Status': mission.status,
      'Location': mission.location,
      'Mission Officer': mission.officer_name,
      'Handlers': mission.handler_names.join(', ') || 'None',
      'Dogs': mission.dog_names.join(', ') || 'None',
      'Date': formatDate(mission.date),
      'Notes': mission.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mission Reports');

    const colWidths = [
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `mission-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    exportMissionsToPDF(missions, filters);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Planning':
        return 'bg-amber-100 text-amber-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-800">Mission Reports</h3>
          <p className="text-sm text-stone-600 mt-1">{missions.length} missions found</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Mission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Officer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Handlers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Dogs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {missions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                  No missions found matching the selected filters
                </td>
              </tr>
            ) : (
              missions.map((mission) => (
                <tr
                  key={mission.id}
                  className="hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-stone-900">{mission.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                      {mission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-900">{mission.location}</td>
                  <td className="px-6 py-4 text-sm text-stone-900">{mission.officer_name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-900">
                      {mission.handler_names.length > 0 ? (
                        <span>{mission.handler_names.join(', ')}</span>
                      ) : (
                        <span className="text-stone-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-900">
                      {mission.dog_names.length > 0 ? (
                        <span>{mission.dog_names.join(', ')}</span>
                      ) : (
                        <span className="text-stone-400">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-900">
                    {formatDate(mission.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
