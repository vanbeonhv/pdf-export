const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const dayjs = require('dayjs');
const AWS = require('aws-sdk');

const { getSecondLineText } = require('./util/getSecondLineText');
const { getFullProjectName } = require('./util/getFullProjectName');
const { getConform } = require('./util/getConform');
const { whLogo } = require('./demoData');
const { getClose } = require('./util/getClose');
const { getWeightage } = require('./util/getWeightage');

const s3bucket = new AWS.S3();
const BUCKET_NAME = 'wh-idd-test';

async function getBase64(key) {
  if (!key) return null;
  const params = { Bucket: BUCKET_NAME, Key: key };
  const data = await s3bucket.getObject(params).promise();
  let buffer64 = Buffer.from(data.Body).toString('base64');
  return 'data:image/png;base64,' + buffer64;
}

exports.handler = async (event) => {
  try {
    const pqaDetail = { ...event };
    const {
      ProjectId,
      FormDate,
      Trade1Score,
      Trade2Score,
      ObservationScore,
      LastMonthPqaScore,
      RFWIRecordsScore,
      FindingScore,
      TotalScore,
      SubAppPqaCheckList1,
      SubAppPqaCheckList2,
      SubAppPqaObservation,
      SubAppPqaLastMonthFinding,
      SubAppPqaRFWIRecords,
      SubAppPqaSafetyEvaluation,
      SubAppPqaFinding,
      Token
    } = pqaDetail;

    const projectName = await getFullProjectName(ProjectId, Token);

    const xStart = 12;
    let rowY = 5;

    const createText = (
      text,
      x,
      y,
      options = {},
      isBold = false,
      fontSize = 9,
      textColor = 'black'
    ) => {
      doc?.setFontSize(fontSize);
      doc?.setTextColor(textColor);
      doc?.setFont(undefined, !isBold ? 'normal' : 'bold');
      doc?.text(text, x, y, options);
    };

    const createTextItalic = (
      text,
      x,
      y,
      options = {},
      fontSize = 9,
      textColor = 'black'
    ) => {
      doc?.setFontSize(fontSize);
      doc?.setTextColor(textColor);
      doc?.setFont(undefined, 'italic');
      doc?.text(text, x, y, options);
    };

    const addNewPage = () => {
      rowY = 5;
      doc.addPage();
      doc.addImage(whLogo, 'JPEG', xStart, rowY, 40, 12);
      createText('Project Quality Audit Checklist', 100, 12, {}, true, 15);
      rowY += 12;
      createText('Project:', xStart, 25, {}, false, 12);
      createText(projectName, 27, 25, {}, false, 12);
      createText('Date:', 140, 25, {}, false, 12);
      createText(dayjs(FormDate).format('DD-MMM-YYYY'), 150, 25, {}, false, 12);
      rowY += 12;
    };

    //Begin generate pdf
    const doc = new jsPDF({
      unit: 'mm',
      format: [190.5, 275.2]
    });

    doc.setLineWidth(1);
    doc.setDrawColor('#000000');

    //First page
    doc.addImage(whLogo, 'JPEG', 45, 55, 100, 30);
    createText('Project Quality Audit', 40, 105, {}, true, 32);
    createText('Project:', 40, 134, {}, false, 22);
    createText(projectName, 68, 134, {}, false, 18);
    createText('Audit Date:', 40, 154, {}, false, 22);
    createText(dayjs(FormDate).format('DD-MMM-YYYY'), 80, 154, {}, false, 18);
    createText('Audited by:', 40, 174, {}, false, 22);
    createText(pqaDetail.Name, 80, 174, {}, false, 18);

    //table
    const headers = [
      [
        'Trade 1',
        'Trade 2',
        'Observation',
        'PQA',
        'RFWI',
        'Findings',
        '       '
      ],
      ['', '', '', ' ', '', '', '']
    ];
    const pointList = [
      [
        Trade1Score,
        Trade2Score,
        ObservationScore,
        SubAppPqaLastMonthFinding.IsActive ? LastMonthPqaScore : 'NA',
        SubAppPqaRFWIRecords.IsTrade5Active ? RFWIRecordsScore : 'NA',
        FindingScore,
        TotalScore
      ]
    ];
    doc.autoTable({
      head: headers,
      body: pointList,
      startY: 200,
      theme: 'plain',
      styles: {
        halign: 'center'
      },
      headStyles: {
        fontSize: 12,
        fontStyle: 'normal',
        cellPadding: { top: 2, right: 3, bottom: 0, left: 3 },
        minCellHeight: 9
      },
      bodyStyles: {
        cellPadding: { top: 5, right: 3, bottom: 0, left: 3 },
        fontSize: 16
      },
      columnStyles: {
        3: { minCellWidth: 23 },
        4: { minCellWidth: 23 },
        6: { fontStyle: 'bold' }
      },
      didDrawPage: function (data) {
        const columnList = data.table.columns;
        const cellHeight = doc.internal.getLineHeight(); // Adjust the line height spacing as needed

        headers[0].forEach((column, columnIndex) => {
          const startX =
            data.settings.margin.left +
            columnList
              .slice(0, columnIndex)
              .reduce(
                (totalWidth, currentWidth) => totalWidth + currentWidth.width,
                0
              );
          const startY = data.settings.startY;

          //add more line for header
          const secondLine = getSecondLineText(columnIndex);
          const textX = startX + columnList[columnIndex].width / 2;
          const textY = startY + 10;

          if (columnIndex === 6) {
            doc.setFont(undefined, 'bold');
            doc.text('Overall', textX, startY + 4, {
              align: 'center',
              baseline: 'middle'
            });
            doc.text('Score', textX, textY, {
              align: 'center',
              baseline: 'middle'
            });
            doc.setFont(undefined, 'normal');
          }

          doc.setFontSize(12);
          // Draw the cell background and borders
          doc.text(secondLine, textX, textY, {
            align: 'center',
            baseline: 'middle'
          });
          if (columnIndex === 2 || columnIndex === 3) {
            doc.text(`(${getWeightage(2)}%)`, textX, textY + 5, {
              align: 'center',
              baseline: 'middle'
            });
          }
          if (columnIndex === 4) {
            doc.text(`(${getWeightage(4)}%)`, textX, textY + 5, {
              align: 'center',
              baseline: 'middle'
            });
          }

          if (columnIndex === 6) {
            doc?.setFont(undefined, 'italic');
            doc.text(
              SubAppPqaLastMonthFinding.IsActive &&
                SubAppPqaRFWIRecords.IsTrade5Active
                ? ''
                : '(pro-rated)',
              textX,
              textY + 5,
              {
                align: 'center',
                baseline: 'middle'
              }
            );
          }

          doc.setLineWidth(0.3);
          doc.setDrawColor('#000000');
          doc.rect(
            startX,
            startY,
            columnList[columnIndex].width,
            cellHeight - 1
          );
          doc.rect(
            startX,
            startY + cellHeight - 1,
            columnList[columnIndex].width,
            13
          );
        });
      }
    });

    //Second page
    addNewPage();
    //#region trade 1 table
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;
    //table trade 1

    const rowsDataTrade1 = [
      [
        '1.1',
        'Latest approved drawing',
        'Conform',
        'Site Findings',
        'Weightage'
      ],
      ['1.2', 'Approved material(s)', '', '', ''],
      ['1.3', 'Approved method statement', '', '', ''],
      ['1.4', 'Test report submission (pass)', '', '', ''],
      ['1.5', 'Trade demo / GPT conducted', '', '', ''],
      ['1.6', 'Trade book ', '', '', ''],
      ['1.7', 'Critical check implemented', '', '', ''],
      ['1.8', 'Common check implemented', '', '', '']
    ];
    const conformList1 = getConform(SubAppPqaCheckList1.ScoreList);
    SubAppPqaCheckList1.ScoreList.forEach((score, index) => {
      if (score === 99) {
        score = '-';
      }

      rowsDataTrade1[index][2] = conformList1[index];

      const siteFinding1 = SubAppPqaCheckList1.NoteList[index];
      rowsDataTrade1[index][3] =
        siteFinding1.length > 38
          ? siteFinding1.slice(0, 35) + '...'
          : siteFinding1;

      rowsDataTrade1[index][4] = score;
    });

    let lastColumnWidth1;
    let secondColumnStartPoint1;
    let forthColumnStartPoint1;
    doc.autoTable({
      head: [
        [
          'S/N',
          ' Audit Items ',
          'Conform',
          'Site Findings          ',
          'Weightage'
        ]
      ],
      body: rowsDataTrade1,
      startY: rowY,
      tableWidth: 164.4,
      margin: { left: xStart },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'left', minCellWidth: 56 },
        4: { halign: 'center' }
      },
      didDrawCell: function (data) {
        lastColumnWidth1 = data.table.columns[4].width;
        secondColumnStartPoint1 = xStart + data.table.columns[0].width;
        forthColumnStartPoint1 =
          xStart +
          data.table.columns[0].width +
          data.table.columns[1].width +
          data.table.columns[2].width;
      }
    });

    // rowY - 1.5 because need to be rendered after the table for always starts at second and third column

    createText('1', xStart + 4, rowY - 1.5, {}, true, 12);
    createText('Trade:', secondColumnStartPoint1 + 1, rowY - 1.5, {}, true, 12);
    createText(
      SubAppPqaCheckList1.Trade,
      secondColumnStartPoint1 + 15,
      rowY - 1.5,
      {},
      false,
      12
    );

    const spaceWithTradeTitle =
      SubAppPqaCheckList1.Trade.length > 28
        ? SubAppPqaCheckList1.Trade.length - 28
        : 0;

    const newLocationX = forthColumnStartPoint1 + spaceWithTradeTitle * 2;
    const newLocationValueX = newLocationX + 20;
    createText('Location:', newLocationX, rowY - 1.5, {}, true, 12);

    createText(
      SubAppPqaCheckList1.Location,
      newLocationValueX,
      rowY - 1.5,
      {},
      false,
      12
    );

    rowY += 8.8;
    createText(`(${getWeightage(1)}%)`, 159.5, rowY, {}, false, 10);

    rowY += 61.9;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(176.4 - lastColumnWidth1, rowY, lastColumnWidth1, 7);
    rowY += 4.8;
    createText('Score', 176.4 - lastColumnWidth1 - 13.3, rowY, {}, false, 12);
    createText(
      Trade1Score.toString(),
      176.4 - lastColumnWidth1 / 2 - 3,
      rowY,
      {},
      true,
      12
    );
    rowY += 5;
    //#endregion trade 1 table

    //#region trade 2 table
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;

    const rowsDataTrade2 = [
      [
        '2.1',
        'Latest approved drawing',
        'Conform',
        'Site Findings',
        'Weightage'
      ],
      ['2.2', 'Approved material(s)', '', '', ''],
      ['2.3', 'Approved method statement', '', '', ''],
      ['2.4', 'Test report submission (pass)', '', '', ''],
      ['2.5', 'Trade demo / GPT conducted', '', '', ''],
      ['2.6', 'Trade book ', '', '', ''],
      ['2.7', 'Critical check implemented', '', '', ''],
      ['2.8', 'Common check implemented', '', '', '']
    ];
    const conformList2 = getConform(SubAppPqaCheckList2.ScoreList);
    SubAppPqaCheckList2.ScoreList.forEach((score, index) => {
      if (score === 99) {
        score = '-';
      }
      rowsDataTrade2[index][2] = conformList2[index];

      const siteFinding2 = SubAppPqaCheckList2.NoteList[index];
      rowsDataTrade2[index][3] =
        siteFinding2.length > 38
          ? siteFinding2.slice(0, 35) + '...'
          : siteFinding2;

      rowsDataTrade2[index][4] = score;
    });

    let lastColumnWidth2;
    let secondColumnStartPoint2;
    let forthColumnStartPoint2;
    doc.autoTable({
      head: [
        [
          'S/N',
          ' Audit Items ',
          'Conform',
          'Site Findings          ',
          'Weightage'
        ]
      ],
      body: rowsDataTrade2,
      startY: rowY,
      margin: { left: xStart },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'left', minCellWidth: 56 },
        4: { halign: 'center' }
      },
      didDrawCell: function (data) {
        lastColumnWidth2 = data.table.columns[4].width;
        secondColumnStartPoint2 = xStart + data.table.columns[0].width;
        forthColumnStartPoint2 =
          xStart +
          data.table.columns[0].width +
          data.table.columns[1].width +
          data.table.columns[2].width;
      }
    });
    createText('2', xStart + 4, rowY - 1.5, {}, true, 12);
    createText('Trade:', secondColumnStartPoint2 + 1, rowY - 1.5, {}, true, 12);
    createText(
      SubAppPqaCheckList2.Trade,
      secondColumnStartPoint1 + 15,
      rowY - 1.5,
      {},
      false,
      12
    );

    const spaceWithTradeTitle2 =
      SubAppPqaCheckList2.Trade.length > 28
        ? SubAppPqaCheckList2.Trade.length - 28
        : 0;

    const newLocationX2 = forthColumnStartPoint2 + spaceWithTradeTitle2 * 2;
    const newLocationValueX2 = newLocationX2 + 20;
    createText('Location:', newLocationX2, rowY - 1.5, {}, true, 12);

    createText(
      SubAppPqaCheckList2.Location,
      newLocationValueX2,
      rowY - 1.5,
      {},
      false,
      12
    );

    rowY += 8.8;
    createText(`(${getWeightage(2)}%)`, 159.5, rowY, {}, false, 10);

    rowY += 61.9;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(176.4 - lastColumnWidth2, rowY, lastColumnWidth2, 7);
    rowY += 4.8;
    createText('Score', 176.4 - lastColumnWidth2 - 13.3, rowY, {}, false, 12);
    createText(
      Trade2Score.toString(),
      176.4 - lastColumnWidth2 / 2 - 3,
      rowY,
      {},
      true,
      12
    );
    rowY += 5;

    //#endregion trade 2 table

    //#region trade 3 table
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;

    const rowsDataObservation = [
      ['3.1', 'Observation', 'Conform', 'Site Findings', 'Weightage'],
      ['3.2', 'Observation', '', '', ''],
      ['3.3', 'Observation', '', '', '']
    ];
    const closeList = getClose(SubAppPqaObservation.ScoreList);
    let isRemark3TooLong = false;

    SubAppPqaObservation.ScoreList.forEach((score, index) => {
      rowsDataObservation[index][1] = SubAppPqaObservation.Observation[index];
      rowsDataObservation[index][2] = closeList[index];

      rowsDataObservation[index][3] = SubAppPqaObservation.RemarkList[index];
      if (SubAppPqaObservation.RemarkList[index].length > 40) {
        isRemark3TooLong = true;
      }

      if (SubAppPqaObservation.ScoreList[index] === 99) {
        SubAppPqaObservation.ScoreList[index] = '-';
      }
      rowsDataObservation[index][4] = SubAppPqaObservation.ScoreList[index];
    });

    let secondColumnStartPoint3;
    let lastColumnWidth3;
    let tableHeight3 = 0;

    doc.autoTable({
      head: [['S/N', 'Observation', 'Close', 'Remark          ', 'Weightage']],
      body: rowsDataObservation,
      startY: rowY,
      margin: { left: xStart },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left', minCellWidth: 46 },
        2: { halign: 'center' },
        3: {
          halign: 'left',
          minCellWidth: 56,
          fontSize: isRemark3TooLong ? 7 : 10
        },
        4: { halign: 'center' }
      },
      didDrawCell: function (data) {
        lastColumnWidth3 = data.table.columns[4].width;
        secondColumnStartPoint3 = xStart + data.table.columns[0].width;
      },
      didDrawPage: function (data) {
        tableHeight3 = data.table.body.reduce(
          (prevValue, currentValue) => (prevValue += currentValue.height),
          0
        );
        tableHeight3 += data.table.head[0].height;
      }
    });

    //#region score box at the end of table
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    createText(
      'Score',
      176.4 - lastColumnWidth3 - 13.3,
      rowY + tableHeight3 + 4.8,
      {},
      false,
      12
    );
    createText(
      ObservationScore.toString(),
      176.4 - lastColumnWidth3 / 2 - 3,
      rowY + tableHeight3 + 4.8,
      {},
      true,
      12
    );
    doc.rect(
      176.4 - lastColumnWidth3,
      rowY + tableHeight3,
      lastColumnWidth3,
      7
    );
    //#endregion score box at the end of table

    createText('3', xStart + 4, rowY - 1.5, {}, true, 12);
    createText(
      'Follow-up on site QA/QC observations:',
      secondColumnStartPoint3 + 1,
      rowY - 1.5,
      {},
      true,
      10
    );
    createText(
      '(select 3 from previous month to verify)',
      secondColumnStartPoint3 + 67,
      rowY - 1.5,
      {},
      false,
      10
    );

    rowY += 8.8;
    createText(`(${getWeightage(3)}%)`, 159.5, rowY, {}, false, 10);

    //#endregion trade 3 table

    //Third page
    addNewPage();
    //#region trade 4 table
    const { yes, partial, no, na, totalFindings } =
      SubAppPqaLastMonthFinding.ScoreList;
    const { IsActive } = SubAppPqaLastMonthFinding;
    const notActive = !IsActive ? '  -  (NA)' : '';
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 25);
    rowY += 6;
    createText('4', xStart + 4, rowY, {}, true, 12);
    createText(
      'Follow-up on last month PQA findings' + notActive,
      secondColumnStartPoint3 + 1,
      rowY,
      {},
      true,
      10
    );
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText(`(${getWeightage(4)}%)`, 160, rowY + 2, {}, false, 10);
    rowY += 4;
    doc.rect(xStart, rowY, 10, 15);
    doc.rect(xStart + 10, rowY, 154.4, 15);
    rowY += 10;
    createText('4.1', xStart + 2, rowY, {}, false, 12);
    createText('Total', xStart + 12, rowY - 2.5, {}, false, 12);
    createText('Findings', xStart + 12, rowY + 2.5, {}, false, 12);
    createText(':', xStart + 30, rowY, {}, false, 12);
    createText(totalFindings.toString(), xStart + 34, rowY, {}, false, 12);
    createText('Yes', xStart + 50, rowY, {}, false, 12);
    createText(':', xStart + 58, rowY, {}, false, 12);
    createText(yes.toString(), xStart + 61, rowY, {}, false, 12);
    createText('Partial', xStart + 76, rowY, {}, false, 12); //+12
    createText(':', xStart + 88, rowY, {}, false, 12);
    createText(partial.toString(), xStart + 92, rowY, {}, false, 12); //+4
    createText('No', xStart + 107, rowY, {}, false, 12); //+15
    createText(':', xStart + 113, rowY, {}, false, 12);
    createText(no.toString(), xStart + 116, rowY, {}, false, 12); //+3
    createText('NA', xStart + 128, rowY, {}, false, 12); //+12
    createText(':', xStart + 134, rowY, {}, false, 12); //+4
    createText(na.toString(), xStart + 138, rowY, {}, false, 12); //+12
    createText(LastMonthPqaScore.toString(), xStart + 150, rowY, {}, true, 12);
    //#endregion trade 4 table

    //#region Trade 5 table
    rowY += 10;

    const generateTrade5 = (scoreList5, tradeTitle, numberTitle) => {
      const {
        tradePoint,
        yesNumber,
        partialNumber,
        noNumber,
        naNumber,
        totalFindings: totalFindingsNumber,
        isActive
      } = scoreList5;
      const remark = scoreList5.remarkRFWI;

      doc.setLineWidth(0.3);
      doc.setDrawColor('#000000');
      doc.rect(xStart, rowY, 10, 20);
      doc.rect(xStart + 10, rowY, 154.4, 20);
      doc.line(154.4, rowY, 154.4, rowY + 20);

      rowY += 5;
      createTextItalic(
        `${tradeTitle}:  ${isActive ? '' : '(NA)'}`,
        xStart + 12,
        rowY,
        {},
        12
      );
      rowY += 9;
      createText(numberTitle, xStart + 2, rowY - 2.5, {}, false, 12);
      createText('Total', xStart + 12, rowY - 2.5, {}, false, 12);
      createText('Findings', xStart + 12, rowY + 2.5, {}, false, 12);
      createText(':', xStart + 30, rowY, {}, false, 12);
      createText(
        totalFindingsNumber.toString(),
        xStart + 34,
        rowY,
        {},
        false,
        12
      );
      createText('Yes', xStart + 50, rowY, {}, false, 12);
      createText(':', xStart + 58, rowY, {}, false, 12);
      createText(yesNumber.toString(), xStart + 61, rowY, {}, false, 12);
      createText('No', xStart + 93, rowY, {}, false, 12);
      createText(':', xStart + 98, rowY, {}, false, 12);
      createText(noNumber.toString(), xStart + 101, rowY, {}, false, 12);
      createText('NA', xStart + 123, rowY, {}, false, 12);
      createText(':', xStart + 129, rowY, {}, false, 12);
      createText(naNumber.toString(), xStart + 133, rowY, {}, false, 12);
      createText(
        isActive ? tradePoint.toString() : '-',
        xStart + 150,
        rowY,
        {},
        true,
        12
      );

      rowY += 6;
      let remarkHeightRFWI = 0;
      doc.autoTable({
        head: [[`Remark: ${remark}`]],
        startY: rowY,
        margin: { left: xStart + 10 },
        theme: 'grid',
        styles: {
          fontStyle: 'normal',
          textColor: '#000',
          lineColor: '#000',
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: '#fff',
          valign: 'top',
          halign: 'left',
          minCellHeight: 18
        },
        didDrawCell: (data) => {
          doc.rect(xStart, rowY, 10, data.cell.height);
          remarkHeightRFWI = remarkHeightRFWI + data.cell.height;
          createText(
            '',
            xStart + 2,
            rowY + remarkHeightRFWI / 2,
            {},
            false,
            12
          );
        }
      });

      rowY = rowY + remarkHeightRFWI;
    };

    //----------TRADE 5 HEADING------------------
    const { Archi, Structural, Mep, IsTrade5Active } = SubAppPqaRFWIRecords;
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 10);
    rowY += 6;
    createText('5', xStart + 4, rowY, {}, true, 12);
    createText(
      `Verification - RFWI records (Scanned copy/Digital archive) ${
        IsTrade5Active ? '' : '- (NA)'
      }`,
      secondColumnStartPoint3 + 1,
      rowY,
      {},
      true,
      10
    );
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText(`(${getWeightage(4)}%)`, 160, rowY + 2, {}, false, 10);
    rowY += 4;

    //------Start generate trade Structural, Archi and Mep
    generateTrade5(Structural, 'Structural', '5.1');
    generateTrade5(Archi, 'Architectural', '5.2');
    generateTrade5(Mep, 'MEP', '5.3');

    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(154.4, rowY, 22, 8);
    rowY += 5;
    createText(
      `${IsTrade5Active ? RFWIRecordsScore.toString() : '-'}`,
      160,
      rowY,
      {},
      true,
      12
    );
    createText('Score', 140, rowY, {}, false, 12);
    //#endregion Trade 5 table

    //#region Trade 6 table
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    rowY += 5;

    const {
      yesNumber: yesNumberSafety,
      noNumber: noNumberSafety,
      naNumber: naNumberSafety,
      totalAward
    } = SubAppPqaSafetyEvaluation.ScoreList;
    const remarkSafety = SubAppPqaSafetyEvaluation.Remark;
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 25);
    rowY += 6;
    createText('6', xStart + 4, rowY, {}, true, 12);
    createText(
      'Vertication Of Pre-Award Safety Evaluation',
      secondColumnStartPoint3 + 1,
      rowY,
      {},
      true,
      10
    );
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText(`(--%)`, 162, rowY + 2, {}, false, 10);

    rowY += 4;
    doc.rect(xStart, rowY, 10, 15);
    doc.rect(xStart + 10, rowY, 154.4, 15);

    rowY += 10;
    createText('6.1', xStart + 2, rowY, {}, false, 12);
    createText('Total Award', xStart + 12, rowY, {}, false, 12);
    createText(':', xStart + 36, rowY, {}, false, 12);
    createText(totalAward.toString(), xStart + 38, rowY, {}, false, 12);
    createText('Yes', xStart + 55, rowY, {}, false, 12);
    createText(':', xStart + 63, rowY, {}, false, 12);
    createText(yesNumberSafety.toString(), xStart + 66, rowY, {}, false, 12);
    createText('No', xStart + 93, rowY, {}, false, 12);
    createText(':', xStart + 99, rowY, {}, false, 12);
    createText(noNumberSafety.toString(), xStart + 103, rowY, {}, false, 12);
    createText('NA', xStart + 123, rowY, {}, false, 12);
    createText(':', xStart + 129, rowY, {}, false, 12);
    createText(naNumberSafety.toString(), xStart + 132, rowY, {}, false, 12);
    createText('-', xStart + 152, rowY, {}, true, 12);

    rowY += 5;
    let remarkHeightSafety = 0;
    doc.autoTable({
      head: [[`Remark: ${remarkSafety}`]],
      startY: rowY,
      margin: { left: xStart + 10 },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'left',
        minCellHeight: 15
      },
      didDrawCell: (data) => {
        doc.rect(xStart, rowY, 10, data.cell.height);
        remarkHeightSafety = remarkHeightSafety + data.cell.height;
        createText(
          '6.2',
          xStart + 2,
          rowY + remarkHeightSafety / 2,
          {},
          false,
          12
        );
      }
    });

    //#endregion Trade 6 table

    //#region trade 7 table
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    rowY = rowY + remarkHeightSafety + 5;
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 10);
    doc.rect(154.4, rowY + 10, 22, 8);

    rowY += 6;
    createText('7', xStart + 4, rowY, {}, true, 12);
    createText(
      'Site findings - detailed report (next page)',
      secondColumnStartPoint3 + 1,
      rowY,
      {},
      true,
      10
    );
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText(`(${getWeightage(7)}%)`, 160, rowY + 2, {}, false, 10);
    rowY += 10;
    createText(FindingScore.toString(), 160, rowY, {}, true, 12);
    createText('Score', 140, rowY, {}, false, 12);
    rowY += 10;
    rowY += 56;
    //#endregion trade 7 table
    addNewPage();

    const rowsDataTrade7InOnePage = [[]];
    const pointListTrade7InOnePage = [[]];
    const imageList = [[]];

    let pageNumberForImage = 0;
    async function processImages() {
      for (let i = 0; i < SubAppPqaFinding.length; i++) {
        if (i > 0 && i % 4 === 0) {
          pageNumberForImage++;
          imageList.push([]);
        }
        const findingImages = SubAppPqaFinding[i].FindingImage;
        const base64Images = await Promise.all(
          findingImages.map(async (image) => await getBase64(image))
        );
        findingImages.splice(0, findingImages.length, ...base64Images);
        imageList[pageNumberForImage].push(findingImages);
      }
    }

    await processImages();

    let pageNumber = 0;
    SubAppPqaFinding.forEach((findings, index) => {
      if (index > 0 && index % 4 === 0) {
        //Divide to group 3 in first page
        //Divide to group 4 findings in one page from secord page
        pageNumber++;
        rowsDataTrade7InOnePage.push([]);
        pointListTrade7InOnePage.push([]);
      }

      rowsDataTrade7InOnePage[pageNumber].push([
        (index + 1).toString(),
        findings.FindingReport
      ]);
      pointListTrade7InOnePage[pageNumber].push({
        SeverityPoint: findings.SeverityPoint,
        FrequencyPoint: findings.FrequencyPoint,
        Points: findings.Points === 99 ? '-' : findings.Points
      });
    });

    const createTrade5Page = (
      rowsDataTrade7,
      pointListTrade7,
      imageListDetail,
      index
    ) => {
      doc.autoTable({
        head: [
          [
            { content: 'S/N', colSpan: 1 },
            { content: 'Findings', colSpan: 1 }
          ]
        ],
        body: rowsDataTrade7,
        startY: rowY,
        margin: { left: xStart },
        theme: 'grid',
        styles: {
          fontStyle: 'normal',
          textColor: '#000',
          lineColor: '#000',
          lineWidth: 0.2
        },
        headStyles: { fillColor: '#fff', valign: 'middle', halign: 'left' },
        columnStyles: {
          0: { minCellWidth: 10, valign: 'middle', halign: 'center' },
          1: {
            minCellWidth: 154,
            cellPadding: { top: 1, right: 28.5, botton: 1, left: 1 }
          }
        },
        bodyStyles: {
          minCellHeight: 56
        },
        didDrawCell: function (data) {}
      });

      rowY = 36.6;
      pointListTrade7.forEach((score, index) => {
        doc.setLineWidth(0.3);
        doc.setDrawColor('#000000');
        doc.rect(148.9, rowY, 27.5, 16);
        rowY += 4;
        createTextItalic('Severity:', 150, rowY, {}, 10);
        createText(score.SeverityPoint.toString(), 170, rowY, {}, false, 10);
        rowY += 5;
        createTextItalic('Frequency:', 150, rowY, {}, 10);
        createText(score.FrequencyPoint.toString(), 170.5, rowY, {}, false, 10);
        rowY += 5;
        createTextItalic('Points:', 150, rowY, {}, 10);
        createText(score.Points.toString(), 170, rowY, {}, false, 10);
        rowY += 42;

        imageListDetail[index][0] &&
          doc.addImage(
            imageListDetail[index][0],
            'JPEG',
            23.5,
            rowY - 37,
            45,
            35
          );
        imageListDetail[index][1] &&
          doc.addImage(
            imageListDetail[index][1],
            'JPEG',
            73.5,
            rowY - 37,
            45,
            35
          );
        imageListDetail[index][2] &&
          doc.addImage(
            imageListDetail[index][2],
            'JPEG',
            123.5,
            rowY - 37,
            45,
            35
          );
      });
    };

    rowsDataTrade7InOnePage.forEach((rowData, index) => {
      const pointListTrade7 = pointListTrade7InOnePage[index];
      const imageListDetail = imageList[index];

      createTrade5Page(rowData, pointListTrade7, imageListDetail, index);
      if (index < rowsDataTrade7InOnePage.length - 1) {
        addNewPage();
      }
    });
    async function uploadObjectToS3Bucket(objectName, objectData) {
      fs.writeFileSync('/tmp/pc.pdf', objectData);
      const fileContent = fs.readFileSync('/tmp/pc.pdf');
      const params = {
        Bucket: BUCKET_NAME,
        Key: objectName,
        Body: fileContent
      };
      await s3bucket.upload(params).promise();
    }

    const arrayBuffer = doc.output('arraybuffer');
    let bf = Buffer.from(arrayBuffer);
    const key = `prefab/subapp/pqa/pdf-form/${event?.Id}.pdf`;
    await uploadObjectToS3Bucket(key, bf);
    return key;
  } catch (err) {
    console.log(err.message);
    return null;
  }
};
