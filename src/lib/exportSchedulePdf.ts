import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScheduleSlot } from '@/types';

interface ExportOptions {
  batchName: string;
  stream: string;
  semester: number;
  year: number;
}

const DAY_ORDER: Record<string, number> = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6,
};

export function exportScheduleToPdf(
  schedules: ScheduleSlot[],
  options: ExportOptions
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Class Schedule', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(options.batchName, pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `${options.stream} | Year ${options.year} | Semester ${options.semester}`,
    pageWidth / 2,
    34,
    { align: 'center' }
  );

  // Generated date
  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`,
    pageWidth / 2,
    40,
    { align: 'center' }
  );

  doc.setTextColor(0);

  // Group schedules by day
  const schedulesByDay = schedules.reduce<Record<string, ScheduleSlot[]>>((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  // Sort days
  const sortedDays = Object.keys(schedulesByDay).sort(
    (a, b) => DAY_ORDER[a] - DAY_ORDER[b]
  );

  // Prepare table data
  const tableData: (string | number)[][] = [];

  sortedDays.forEach((day) => {
    const daySchedules = schedulesByDay[day].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    daySchedules.forEach((slot, index) => {
      tableData.push([
        index === 0 ? day : '',
        `${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`,
        slot.courseName,
        slot.type.charAt(0).toUpperCase() + slot.type.slice(1),
        slot.teacherName,
        slot.roomName,
      ]);
    });

    // Add empty row between days for visual separation
    if (sortedDays.indexOf(day) < sortedDays.length - 1) {
      tableData.push(['', '', '', '', '', '']);
    }
  });

  // Generate table
  autoTable(doc, {
    startY: 48,
    head: [['Day', 'Time', 'Course', 'Type', 'Faculty', 'Room']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 60 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 50 },
      5: { cellWidth: 30, halign: 'center' },
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    didParseCell: (data) => {
      // Style type column based on value
      if (data.column.index === 3 && data.section === 'body') {
        const value = String(data.cell.raw).toLowerCase();
        if (value === 'lab') {
          data.cell.styles.textColor = [234, 88, 12];
          data.cell.styles.fontStyle = 'bold';
        } else if (value === 'tutorial') {
          data.cell.styles.textColor = [34, 197, 94];
          data.cell.styles.fontStyle = 'bold';
        } else if (value === 'lecture') {
          data.cell.styles.textColor = [59, 130, 246];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `schedule-${options.batchName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
