import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './dateFormat';
import { formatHandlersWithDogs, PersonnelWithDog } from './missionPersonnel';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface MissionReportData {
  id: string;
  name: string;
  status: string;
  location: string;
  date: string;
  officer_name: string;
  team_leader_name: string;
  handler_names: string[];
  handlersWithDogs: PersonnelWithDog[];
  dog_names: string[];
  notes: string;
}

export function exportMissionsToPDF(missions: MissionReportData[], filters?: {
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  status?: string;
}) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text('Mission Reports', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  let yPos = 25;

  if (filters) {
    doc.text('Filters Applied:', 14, yPos);
    yPos += 5;

    if (filters.dateFrom && filters.dateTo) {
      doc.text(`Date Range: ${filters.dateFrom} to ${filters.dateTo}`, 14, yPos);
      yPos += 5;
    }
    if (filters.location) {
      doc.text(`Location: ${filters.location}`, 14, yPos);
      yPos += 5;
    }
    if (filters.status) {
      doc.text(`Status: ${filters.status}`, 14, yPos);
      yPos += 5;
    }
    yPos += 5;
  }

  const tableData = missions.map(mission => [
    mission.name,
    mission.status,
    mission.location,
    mission.officer_name,
    mission.team_leader_name || '—',
    formatHandlersWithDogs(mission.handlersWithDogs),
    mission.dog_names.join(', ') || 'None',
    formatDate(mission.date)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['Mission', 'Status', 'Location', 'Officer', 'Team Leader', 'Handlers', 'Dogs', 'Date']],
    body: tableData,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 10 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 35 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    }
  });

  const filename = `mission-reports-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function exportMissionDetailToPDF(mission: MissionReportData) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text('Mission Detail Report', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  let yPos = 30;

  doc.setFont('helvetica', 'bold');
  doc.text('Mission Name:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(mission.name, 60, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(mission.status, 60, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(mission.location, 60, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Mission Officer:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(mission.officer_name, 60, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Team Leader:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(mission.team_leader_name || '—', 60, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(mission.date), 60, yPos);
  yPos += 10;

  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Handlers with Dogs:', 14, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  if (mission.handlersWithDogs.length > 0) {
    const formattedHandlers = formatHandlersWithDogs(mission.handlersWithDogs).split(', ');
    formattedHandlers.forEach(handler => {
      doc.text(`• ${handler}`, 20, yPos);
      yPos += 7;
    });
  } else {
    doc.text('None', 20, yPos);
    yPos += 7;
  }

  yPos += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Dogs Deployed:', 14, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  if (mission.dog_names.length > 0) {
    mission.dog_names.forEach(dog => {
      doc.text(`• ${dog}`, 20, yPos);
      yPos += 7;
    });
  } else {
    doc.text('None', 20, yPos);
    yPos += 7;
  }

  if (mission.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(mission.notes, pageWidth - 28);
    doc.text(splitNotes, 14, yPos);
  }

  const filename = `mission-${mission.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
