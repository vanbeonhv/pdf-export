const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const doc = new jsPDF();

const headers = [['Trade 1', '10%', '']]; // Header with three lines

const rowData = ['Row Data']; // Single row of data

doc.autoTable({
  head: headers,
  body: [rowData],
  startY: 20, // Adjust the starting Y position according to your needs
  didDrawPage: function (data) {
    // Customize the header cells to have three lines
    doc.setFontSize(12);
    doc.setFontStyle('bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(0, 0, 0);
    doc.setDrawColor(0);

    const cellWidth = data.table.width / headers[0].length;
    const cellHeight = doc.internal.getLineHeight() * 1.2; // Adjust the line height spacing as needed
    const lineHeight = doc.internal.getLineHeight();

    headers[0].forEach((line, columnIndex) => {
      const startX = data.table.x + columnIndex * cellWidth;
      const startY = data.table.y;

      const lines = line.split('\n'); // Split the line into separate lines if needed

      // Draw each line of the header cell
      lines.forEach((headerLine, lineIndex) => {
        const textX = startX + cellWidth / 2;
        const textY = startY + cellHeight + lineIndex * lineHeight;

        doc.text(headerLine, textX, textY, { align: 'center', baseline: 'middle' });
      });

      // Draw the cell background and borders
      doc.rect(startX, startY, cellWidth, cellHeight + (lines.length - 1) * lineHeight, 'FD');
    });
  },
});

doc.save('output.pdf');
