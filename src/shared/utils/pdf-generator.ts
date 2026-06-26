import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PDFTableColumn {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  key: string;
}

export function generateReportPDF(
  title: string,
  employeeInfo: { name: string; code: string },
  columns: PDFTableColumn[],
  rows: any[],
  hierarchyInfo?: { department?: string; designation?: string; reportingTo?: string }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Use absolute path to logo from project root
      const logoPath = path.join(process.cwd(), 'src/assets/app_logo.png');

      const drawWatermark = (pdfDoc: PDFKit.PDFDocument) => {
        try {
          pdfDoc.save();
          pdfDoc.opacity(0.15); // more visible watermark
          pdfDoc.image(
            logoPath,
            (pdfDoc.page.width - 300) / 2, // centered x
            (pdfDoc.page.height - 300) / 2, // centered y
            { width: 300 }
          );
          pdfDoc.restore();
        } catch (err) {
          console.warn('Failed to draw watermark:', err);
        }
      };

      // Draw watermark on first page
      drawWatermark(doc);

      // Draw watermark on all subsequently added pages
      doc.on('pageAdded', () => {
        drawWatermark(doc);
      });

      // --- Draw Premium Header ---
      // Primary Accent: Fiery Coral/Orange (#FF4D1C)
      doc.rect(0, 0, doc.page.width, 100).fill('#FF4D1C');

      // Add accent stripe
      doc.rect(0, 95, doc.page.width, 5).fill('#FFB300');

      doc.fillColor('#FFFFFF');
      doc.fontSize(22).font('Helvetica-Bold').text(title, 50, 30);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Tionix ERP System - Mobile Reports`, 50, 60);

      // --- Draw Employee Metadata Info Card ---
      doc.fillColor('#475569');
      doc.roundedRect(50, 120, doc.page.width - 100, 70, 8).fill('#F8FAFC'); // very light slate grey container

      // Border for card
      doc.lineWidth(1).strokeColor('#E2E8F0').roundedRect(50, 120, doc.page.width - 100, 70, 8).stroke();

      // Left Accent Color Strip
      doc.rect(50, 120, 4, 70).fill('#FF4D1C');

      doc.fillColor('#475569');
      doc.fontSize(10).font('Helvetica-Bold').text('Personal Details', 70, 135);

      doc.font('Helvetica').text(`Name: ${employeeInfo.name}`, 70, 155);
      doc.text(`Code: ${employeeInfo.code}`, 220, 155);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 370, 155);

      // Add hierarchical information if provided
      if (hierarchyInfo) {
        let yPos = 175;
        if (hierarchyInfo.department) {
          doc.text(`Department: ${hierarchyInfo.department}`, 70, yPos);
          yPos += 15;
        }
        if (hierarchyInfo.designation) {
          doc.text(`Designation: ${hierarchyInfo.designation}`, 70, yPos);
          yPos += 15;
        }
        if (hierarchyInfo.reportingTo) {
          doc.text(`Reporting To: ${hierarchyInfo.reportingTo}`, 70, yPos);
        }
      }

      // --- Draw Table ---
      const tableTop = hierarchyInfo ? 250 : 220;
      let currentY = tableTop;

      // Draw table headers
      doc.fillColor('#FFF5F2'); // very light primary tint background for header row
      doc.rect(50, currentY, doc.page.width - 100, 24).fill();

      doc.fillColor('#1E293B'); // dark color for header text
      doc.fontSize(9).font('Helvetica-Bold');
      
      let currentX = 50;
      columns.forEach((col) => {
        const textOptions = { width: col.width, align: col.align || 'left' };
        doc.text(col.header, currentX + 5, currentY + 7, textOptions);
        currentX += col.width;
      });

      currentY += 24;

      // Draw table rows
      doc.font('Helvetica').fontSize(9);
      rows.forEach((row, rowIndex) => {
        // Alternating row background
        if (rowIndex % 2 === 1) {
          doc.fillColor('#F8FAFC');
          doc.rect(50, currentY, doc.page.width - 100, 22).fill();
        }

        // Draw light bottom border for row
        doc.lineWidth(0.5).strokeColor('#E2E8F0').moveTo(50, currentY + 22).lineTo(doc.page.width - 50, currentY + 22).stroke();

        doc.fillColor('#1E293B');
        let x = 50;
        columns.forEach((col) => {
          const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
          const textOptions = { width: col.width, align: col.align || 'left' };
          doc.text(val, x + 5, currentY + 6, textOptions);
          x += col.width;
        });

        currentY += 22;

        // Check if page height exceeded
        if (currentY > doc.page.height - 80) {
          doc.addPage();
          currentY = 50;

          // Re-draw headers on new page
          doc.fillColor('#FFF5F2');
          doc.rect(50, currentY, doc.page.width - 100, 24).fill();

          doc.fillColor('#1E293B');
          doc.font('Helvetica-Bold');

          let headerX = 50;
          columns.forEach((col) => {
            const textOptions = { width: col.width, align: col.align || 'left' };
            doc.text(col.header, headerX + 5, currentY + 7, textOptions);
            headerX += col.width;
          });
          doc.font('Helvetica');
          currentY += 24;
        }
      });

      // --- Draw Footer ---
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#94A3B8');
        doc.fontSize(8).text(
          `Page ${i + 1} of ${range.count}  •  Tionix ERP Systems`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
