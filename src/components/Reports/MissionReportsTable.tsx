import { useState } from 'react';
import { Download, FileText, Printer, ChevronDown, ChevronRight } from 'lucide-react';
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
  departure_time: string | null;
  return_time: string | null;
  training: boolean;
  search: boolean;
  num_items_searched: number;
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

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const handleExportExcel = () => {
    const exportData = missions.map(mission => ({
      'Mission Name': mission.name,
      'Status': mission.status,
      'Date': formatDate(mission.date),
      'Location': mission.location,
      'Mission Officer': mission.officer_name,
      'Handlers': mission.handler_names.join(', ') || 'None',
      'Dogs': mission.dog_names.join(', ') || 'None',
      'Departure Time': formatTime(mission.departure_time),
      'Return Time': formatTime(mission.return_time),
      'Training': mission.training ? 'Yes' : 'No',
      'Search': mission.search ? 'Yes' : 'No',
      'Items Searched': mission.num_items_searched,
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
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden screen-only">
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
              className="flex items-center gap-2"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider w-8"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Mission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Officer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Teams
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
                  <>
                    <tr
                      key={mission.id}
                      className="hover:bg-stone-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                    >
                      <td className="px-6 py-4">
                        {selectedMission === mission.id ? (
                          <ChevronDown className="w-4 h-4 text-stone-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-stone-600" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-stone-900">{mission.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mission.status)}`}>
                          {mission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-900">
                        {formatDate(mission.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-900">{mission.location}</td>
                      <td className="px-6 py-4 text-sm text-stone-900">{mission.officer_name}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-600">
                          {mission.handler_names.length} handlers, {mission.dog_names.length} dogs
                        </div>
                      </td>
                    </tr>
                    {selectedMission === mission.id && (
                      <tr key={`${mission.id}-details`} className="bg-stone-50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-stone-900 mb-3">Personnel</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Mission Officer:</span>
                                  <p className="text-sm text-stone-900">{mission.officer_name}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Handlers:</span>
                                  <p className="text-sm text-stone-900">
                                    {mission.handler_names.length > 0 ? mission.handler_names.join(', ') : 'None'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Dogs Deployed:</span>
                                  <p className="text-sm text-stone-900">
                                    {mission.dog_names.length > 0 ? mission.dog_names.join(', ') : 'None'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-stone-900 mb-3">Operations</h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Departure Time:</span>
                                  <p className="text-sm text-stone-900">{formatTime(mission.departure_time)}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Return Time:</span>
                                  <p className="text-sm text-stone-900">{formatTime(mission.return_time)}</p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Type:</span>
                                  <p className="text-sm text-stone-900">
                                    {mission.training && 'Training'} {mission.search && 'Search'}
                                    {!mission.training && !mission.search && 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-stone-500">Items Searched:</span>
                                  <p className="text-sm text-stone-900">{mission.num_items_searched}</p>
                                </div>
                              </div>
                            </div>
                            {mission.notes && (
                              <div className="md:col-span-2">
                                <h4 className="font-semibold text-stone-900 mb-3">Notes</h4>
                                <p className="text-sm text-stone-700 whitespace-pre-wrap">{mission.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="print-only">
        <div className="print-header">
          <h1>K9 Mission Reports</h1>
          <div className="print-meta">
            {filters?.dateFrom && filters?.dateTo && (
              <p>Period: {formatDate(filters.dateFrom)} - {formatDate(filters.dateTo)}</p>
            )}
            {filters?.location && <p>Location: {filters.location}</p>}
            {filters?.status && <p>Status: {filters.status}</p>}
            <p>Generated: {formatDate(new Date().toISOString())}</p>
            <p>Total Missions: {missions.length}</p>
          </div>
        </div>

        {missions.map((mission, index) => (
          <div key={mission.id} className="print-mission">
            <div className="print-mission-header">
              <h2>{mission.name}</h2>
              <span className={`print-status ${mission.status.toLowerCase()}`}>{mission.status}</span>
            </div>

            <div className="print-section">
              <h3>Mission Core</h3>
              <table className="print-table">
                <tbody>
                  <tr>
                    <td className="print-label">Date:</td>
                    <td>{formatDate(mission.date)}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Location:</td>
                    <td>{mission.location}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Departure Time:</td>
                    <td>{formatTime(mission.departure_time)}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Return Time:</td>
                    <td>{formatTime(mission.return_time)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="print-section">
              <h3>Personnel</h3>
              <table className="print-table">
                <tbody>
                  <tr>
                    <td className="print-label">Mission Officer:</td>
                    <td>{mission.officer_name}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Handlers:</td>
                    <td>{mission.handler_names.length > 0 ? mission.handler_names.join(', ') : 'None'}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Dogs Deployed:</td>
                    <td>{mission.dog_names.length > 0 ? mission.dog_names.join(', ') : 'None'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="print-section">
              <h3>Operations</h3>
              <table className="print-table">
                <tbody>
                  <tr>
                    <td className="print-label">Training Mission:</td>
                    <td>{mission.training ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Search Mission:</td>
                    <td>{mission.search ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr>
                    <td className="print-label">Items Searched:</td>
                    <td>{mission.num_items_searched}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mission.notes && (
              <div className="print-section">
                <h3>Notes / Comments</h3>
                <p className="print-notes">{mission.notes}</p>
              </div>
            )}

            {index < missions.length - 1 && <div className="print-page-break"></div>}
          </div>
        ))}
      </div>

      <style>{`
        .screen-only {
          display: block;
        }
        .print-only {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .screen-only {
            display: none !important;
          }

          .print-only,
          .print-only * {
            visibility: visible;
          }

          .print-only {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }

          @page {
            size: A4 portrait;
            margin: 20mm;
          }

          .print-header {
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }

          .print-header h1 {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #000;
          }

          .print-meta {
            font-size: 10pt;
            line-height: 1.5;
            color: #333;
          }

          .print-meta p {
            margin: 2px 0;
          }

          .print-mission {
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .print-mission-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #000;
          }

          .print-mission-header h2 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0;
            color: #000;
          }

          .print-status {
            padding: 4px 12px;
            border: 1px solid #000;
            border-radius: 4px;
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
          }

          .print-status.active {
            background: #e0e0e0;
          }

          .print-status.completed {
            background: #d0d0d0;
          }

          .print-status.emergency {
            background: #f0f0f0;
          }

          .print-section {
            margin-bottom: 15px;
          }

          .print-section h3 {
            font-size: 12pt;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
          }

          .print-table td {
            padding: 4px 8px;
            vertical-align: top;
          }

          .print-label {
            font-weight: bold;
            width: 30%;
            color: #000;
          }

          .print-notes {
            font-size: 10pt;
            line-height: 1.5;
            white-space: pre-wrap;
            color: #333;
            padding: 8px;
            border: 1px solid #ccc;
          }

          .print-page-break {
            page-break-after: always;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </>
  );
}
