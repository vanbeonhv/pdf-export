const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const { fetchPqaData } = require('./fetchPqaData');
const { exec } = require('child_process');
const dayjs = require('dayjs');
const { fs } = require('fs');
const { convertFont } = require('./convertFont');
const { getSecondLineText } = require('./util/getSecondLineText');
const { getFullProjectName } = require('./util/getFullProjectName');
const { getConform } = require('./util/getConfrom');
const { pqaDetail, fontData, whLogo } = require('./demoData');
const { getClose } = require('./util/getClose');

// fetchPqaData('8e6251a4-49f6-4552-8b1c-73302519d6aa')
//   .then((data) => {
//     generatePdf(data);
//   })
//   .catch((error) => {
//     console.error('Error generating PDF:', error);
//   });

const generatePdf = (pqaDetail) => {
  const {
    projectCode,
    createdDate,
    trade1Score,
    trade2Score,
    observationScore,
    lastMonthPqaScore,
    findingScore,
    totalScore,
    subAppPqaCheckList1,
    subAppPqaCheckList2,
    subAppPqaObservation,
    subAppPqaLastMonthFinding,
    subAppPqaFinding,
  } = pqaDetail;

  const projectName = getFullProjectName(projectCode);

  const xStart = 12;
  let rowY = 5;

  const createText = (text, x, y, options = {}, isBold = false, fontSize = 9, textColor = 'black') => {
    doc?.setFontSize(fontSize);
    doc?.setTextColor(textColor);
    doc?.setFont(undefined, !isBold ? 'normal' : 'bold');
    doc?.text(text, x, y, options);
  };

  const checkAddPage = (y) => y >= 275;

  const addNewPage = () => {
    doc.addPage();
    doc.addImage(whLogo, 'JPEG', xStart, rowY, 40, 12);
    createText('Project Quality Audit Checklist', 100, 12, {}, true, 15);
    rowY += 12;
    createText('Project:', xStart, 25, {}, false, 12);
    createText(projectName, 27, 25, {}, false, 12);
    createText('Date:', 140, 25, {}, false, 12);
    createText(dayjs(createdDate).format('DD-MMM-YYYY'), 150, 25, {}, false, 12);
    rowY += 12;
  };

  //Begin generate pdf
  const doc = new jsPDF({
    unit: 'mm',
    format: [190.5, 275.2],
  });

  //First page
  doc.addFileToVFS('FiraSans.ttf', fontData);
  doc.addImage(whLogo, 'JPEG', 45, 55, 100, 30);
  createText('Project Quality Audit', 40, 105, {}, true, 32);
  createText('Project:', 40, 134, {}, false, 22);
  createText(projectName, 68, 134, {}, false, 18);
  createText('Audit Date:', 40, 154, {}, false, 22);
  createText(dayjs(createdDate).format('DD-MMM-YYYY'), 80, 154, {}, false, 18);
  createText('Audited by:', 40, 174, {}, false, 22);
  createText(pqaDetail.name, 80, 174, {}, false, 18);

  //table
  const headers = [
    ['Trade 1', 'Trade 2', 'Observation', 'PQA', 'Findings', '       '],
    ['', '', '', ' ', '', ''],
  ];
  const pointList = [[trade1Score, trade2Score, observationScore, lastMonthPqaScore, findingScore, '']];
  doc.autoTable({
    head: headers,
    body: pointList,
    startY: 200,
    theme: 'plain',
    styles: {
      halign: 'center',
    },
    headStyles: {
      fontSize: 12,
      fontStyle: 'normal',
      cellPadding: { top: 2, right: 5, bottom: 0, left: 5 },
      minCellHeight: 9,
    },
    bodyStyles: {
      cellPadding: { top: 5, right: 5, bottom: 0, left: 5 },
      fontSize: 18,
    },
    didDrawPage: function (data) {
      const columnList = data.table.columns;
      const cellHeight = doc.internal.getLineHeight(); // Adjust the line height spacing as needed

      headers[0].forEach((column, columnIndex) => {
        const startX =
          data.settings.margin.left +
          columnList.slice(0, columnIndex).reduce((totalWidth, currentWidth) => totalWidth + currentWidth.width, 0);
        const startY = data.settings.startY;

        //add more line for header
        const secondLine = getSecondLineText(columnIndex);
        const textX = startX + columnList[columnIndex].width / 2;
        const textY = startY + 10;

        if (columnIndex === 5) {
          doc.setFont(undefined, 'bold');
          doc.text('Overall', textX, startY + 4, { align: 'center', baseline: 'middle' });
          doc.text('Score', textX, textY, { align: 'center', baseline: 'middle' });
          doc.setFont(undefined, 'normal');
        }

        doc.setFontSize(12);
        // Draw the cell background and borders
        doc.text(secondLine, textX, textY, { align: 'center', baseline: 'middle' });
        if (columnIndex === 2 || columnIndex === 3) {
          doc.text('(15%)', textX, textY + 5, { align: 'center', baseline: 'middle' });
        }

        doc.setLineWidth(0.3);
        doc.setDrawColor('#000000');
        doc.rect(startX, startY, columnList[columnIndex].width, cellHeight - 1);
        doc.rect(startX, startY + cellHeight - 1, columnList[columnIndex].width, 13);
      });
      doc.setFont(undefined, 'bold');
      doc.setFontSize(18);
      doc.text(totalScore.toString(), 166, 226.5, { align: 'center', baseline: 'middle' });
    },
  });

  //Second page

  //#region trade 1 table
  addNewPage();
  doc.rect(xStart, rowY - 2, 164.4, 6);
  rowY += 2;
  createText('1    Trade:', 17, rowY + 0.5, {}, true, 12);
  createText(subAppPqaCheckList1.trade, 38, rowY + 0.5, {}, false, 12);
  createText('Location:', 87, rowY + 0.5, {}, true, 12);
  createText(subAppPqaCheckList1.location, 107, rowY + 0.5, {}, false, 12);
  rowY += 2;

  //table trade 1

  const rowsDataTrade1 = [
    ['1.1', 'Latest approved drawing', 'Conform', 'Site Findings', 'Weightage'],
    ['1.2', 'Approved material(s)', '', '', ''],
    ['1.3', 'Approved method statement', '', '', ''],
    ['1.4', 'Test report submission (pass)', '', '', ''],
    ['1.5', 'Trade demo / GPT conducted', '', '', ''],
    ['1.6', 'Trade book ', '', '', ''],
    ['1.7', 'Critical check implemented', '', '', ''],
    ['1.8', 'Common check implemented', '', '', ''],
  ];
  const conformList1 = getConform(subAppPqaCheckList1.scoreList);
  subAppPqaCheckList1.scoreList.forEach((score, index) => {
    rowsDataTrade1[index][2] = conformList1[index];
    rowsDataTrade1[index][3] = subAppPqaCheckList1.noteList[index];
    rowsDataTrade1[index][4] = subAppPqaCheckList1.scoreList[index];
  });

  doc.autoTable({
    head: [['S/N', ' Audit Items ', 'Conform', 'Site Findings          ', 'Weightage']],
    body: rowsDataTrade1,
    startY: rowY,
    margin: { left: xStart },
    theme: 'grid',
    styles: { fontStyle: 'normal', textColor: '#000', lineColor: '#000', lineWidth: 0.2 },
    headStyles: { fillColor: '#fff', valign: 'middle', halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'left' },
      4: { halign: 'center' },
    },
  });

  doc.rect(150.7, 101.2, 25.8, 7);
  createText('Score', 137, 106, {}, false, 12);
  createText(trade1Score.toString(), 161, 106, {}, true, 12);

  //#endregion trade 1 table

  //#region trade 2 table
  doc.rect(xStart, 114, 164.4, 6);
  createText('2    Trade:', 17, 119, {}, true, 12);
  createText(subAppPqaCheckList2.trade, 38, 119, {}, false, 12);
  createText('Location:', 87, 119, {}, true, 12);
  createText(subAppPqaCheckList2.location, 107, 119, {}, false, 12);

  const rowsDataTrade2 = [
    ['2.1', 'Latest approved drawing', 'Conform', 'Site Findings', 'Weightage'],
    ['2.2', 'Approved material(s)', '', '', ''],
    ['2.3', 'Approved method statement', '', '', ''],
    ['2.4', 'Test report submission (pass)', '', '', ''],
    ['2.5', 'Trade demo / GPT conducted', '', '', ''],
    ['2.6', 'Trade book ', '', '', ''],
    ['2.7', 'Critical check implemented', '', '', ''],
    ['2.8', 'Common check implemented', '', '', ''],
  ];
  const conformList2 = getConform(subAppPqaCheckList2.scoreList);
  subAppPqaCheckList2.scoreList.forEach((score, index) => {
    rowsDataTrade2[index][2] = conformList2[index];
    rowsDataTrade2[index][3] = subAppPqaCheckList2.noteList[index];
    rowsDataTrade2[index][4] = subAppPqaCheckList2.scoreList[index];
  });

  doc.autoTable({
    head: [['S/N', ' Audit Items ', 'Conform', 'Site Findings          ', 'Weightage']],
    body: rowsDataTrade2,
    startY: 120,
    margin: { left: xStart },
    theme: 'grid',
    styles: { fontStyle: 'normal', textColor: '#000', lineColor: '#000', lineWidth: 0.2 },
    headStyles: { fillColor: '#fff', valign: 'middle', halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'left' },
      4: { halign: 'center' },
    },
  });

  doc.rect(150.7, 188.3, 25.8, 7);
  createText('Score', 137, 193, {}, false, 12);
  createText(trade2Score.toString(), 161, 193, {}, true, 12);

  //#endregion trade 2 table

  //#region trade 3 table
  doc.rect(xStart, 203, 164.4, 6);
  createText('3     Follow-up on site QA/QC observations:', 17, 207, {}, true, 10);
  createText('(select 3 from previous month to verify)', 90, 207, {}, false, 10);

  const rowsDataObservation = [
    ['3.1', 'Observation', 'Conform', 'Site Findings', 'Weightage'],
    ['3.2', 'Observation', '', '', ''],
    ['3.3', 'Observation', '', '', ''],
  ];
  const closeList = getClose(subAppPqaObservation.scoreList);
  subAppPqaObservation.scoreList.forEach((score, index) => {
    rowsDataObservation[index][1] = subAppPqaObservation.observation[index];
    rowsDataObservation[index][2] = closeList[index];
    rowsDataObservation[index][3] = subAppPqaObservation.remarkList[index];
    rowsDataObservation[index][4] = subAppPqaObservation.scoreList[index];
  });

  doc.autoTable({
    head: [['S/N', 'Observation', 'Close', 'Remark          ', 'Weightage']],
    body: rowsDataObservation,
    startY: 209,
    margin: { left: xStart },
    theme: 'grid',
    styles: { fontStyle: 'normal', textColor: '#000', lineColor: '#000', lineWidth: 0.2 },
    headStyles: { fillColor: '#fff', valign: 'middle', halign: 'center' },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'left' },
      4: { halign: 'center' },
    },
  });

  doc.rect(150.7, 188.3, 25.8, 7);
  createText('Score', 137, 193, {}, false, 12);
  createText(trade2Score.toString(), 161, 193, {}, true, 12);

  //#endregion trade 3 table

  doc.save('output.pdf');

  exec('start output.pdf');
};

generatePdf(pqaDetail);
