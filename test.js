const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const dayjs = require('dayjs');
const AWS = require('aws-sdk');
const axios = require('axios');

const { getSecondLineText } = require('./util/getSecondLineText');
const { getFullProjectName } = require('./util/getFullProjectName');
const { getConform } = require('./util/getConfrom');
const { whLogo } = require('./demoData');
const { getClose } = require('./util/getClose');

const s3bucket = new AWS.S3();
const BUCKET_NAME = 'wh-idd-test';

async function getBase64(key) {
  if (!key) return null;
  const params = { Bucket: BUCKET_NAME, Key: `prefab/${key}` };
  const data = await s3bucket.getObject(params).promise();
  let buffer64 = Buffer.from(data.Body).toString('base64');
  return 'data:image/png;base64,' + buffer64;
}

exports.handler = async (event) => {
  try {
    const pqaDetail = { ...event };
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

    const createTextItalic = (text, x, y, options = {}, fontSize = 9, textColor = 'black') => {
      doc?.setFontSize(fontSize);
      doc?.setTextColor(textColor);
      doc?.setFont(undefined, 'italic');
      doc?.text(text, x, y, options);
    };

    const checkAddPage = (y) => y >= 275;

    const addNewPage = () => {
      rowY = 5;
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

    doc.setLineWidth(1);
    doc.setDrawColor('#000000');

    //First page
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
      columnStyles: {
        3: { minCellWidth: 23 },
        5: { minCellWidth: 23 },
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
            doc.text('Overall', textX, startY + 4, {
              align: 'center',
              baseline: 'middle',
            });
            doc.text('Score', textX, textY, {
              align: 'center',
              baseline: 'middle',
            });
            doc.setFont(undefined, 'normal');
          }

          doc.setFontSize(12);
          // Draw the cell background and borders
          doc.text(secondLine, textX, textY, {
            align: 'center',
            baseline: 'middle',
          });
          if (columnIndex === 2 || columnIndex === 3) {
            doc.text('(15%)', textX, textY + 5, {
              align: 'center',
              baseline: 'middle',
            });
          }

          doc.setLineWidth(0.3);
          doc.setDrawColor('#000000');
          doc.rect(startX, startY, columnList[columnIndex].width, cellHeight - 1);
          doc.rect(startX, startY + cellHeight - 1, columnList[columnIndex].width, 13);
        });
        doc.setFont(undefined, 'bold');
        doc.setFontSize(18);
        doc.text(totalScore.toString(), 164, 226.5, {
          align: 'center',
          baseline: 'middle',
        });
      },
    });

    //Second page

    //#region trade 1 table
    doc.addPage();
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;
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

    let lastColumnWidth1;
    let secondColumnStartPoint1;
    let thirdColumnStartPoint1;
    doc.autoTable({
      head: [['S/N', ' Audit Items ', 'Conform', 'Site Findings          ', 'Weightage']],
      body: rowsDataTrade1,
      startY: rowY,
      tableWidth: 164.4,
      margin: { left: xStart },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10,
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'left', minCellWidth: 56 },
        4: { halign: 'center' },
      },
      didDrawCell: function (data) {
        lastColumnWidth1 = data.table.columns[4].width;
        secondColumnStartPoint1 = xStart + data.table.columns[0].width;
        thirdColumnStartPoint1 = xStart + data.table.columns[0].width + data.table.columns[1].width;
      },
    });

    // rowY - 1.5 because need to be rendered after the table for always starts at second and third column

    createText('1', xStart + 4, rowY - 1.5, {}, true, 12);
    createText('Trade:', secondColumnStartPoint1 + 1, rowY - 1.5, {}, true, 12);
    createText(subAppPqaCheckList1.trade, secondColumnStartPoint1 + 15, rowY - 1.5, {}, false, 12);
    createText('Location:', thirdColumnStartPoint1 + 1, rowY - 1.5, {}, true, 12);
    createText(subAppPqaCheckList1.location, thirdColumnStartPoint1 + 22, rowY - 1.5, {}, false, 12);

    rowY += 8.8;
    createText('(10%)', 159.5, rowY, {}, false, 10);

    rowY += 61.9;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(176.4 - lastColumnWidth1, rowY, lastColumnWidth1, 7);
    rowY += 4.8;
    createText('Score', 176.4 - lastColumnWidth1 - 13.3, rowY, {}, false, 12);
    createText(trade1Score.toString(), 176.4 - lastColumnWidth1 / 2 - 3, rowY, {}, true, 12);
    rowY += 5;
    //#endregion trade 1 table

    //#region trade 2 table
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;

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

    let lastColumnWidth2;
    let secondColumnStartPoint2;
    let thirdColumnStartPoint2;
    doc.autoTable({
      head: [['S/N', ' Audit Items ', 'Conform', 'Site Findings          ', 'Weightage']],
      body: rowsDataTrade2,
      startY: rowY,
      margin: { left: xStart },
      theme: 'grid',
      styles: {
        fontStyle: 'normal',
        textColor: '#000',
        lineColor: '#000',
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10,
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'left', minCellWidth: 56 },
        4: { halign: 'center' },
      },
      didDrawCell: function (data) {
        lastColumnWidth2 = data.table.columns[4].width;
        secondColumnStartPoint2 = xStart + data.table.columns[0].width;
        thirdColumnStartPoint2 = xStart + data.table.columns[0].width + data.table.columns[1].width;
      },
    });
    createText('2', xStart + 4, rowY - 1.5, {}, true, 12);
    createText('Trade:', secondColumnStartPoint2 + 1, rowY - 1.5, {}, true, 12);
    createText(subAppPqaCheckList2.trade, secondColumnStartPoint1 + 15, rowY - 1.5, {}, false, 12);
    createText('Location:', thirdColumnStartPoint2 + 1, rowY - 1.5, {}, true, 12);
    createText(subAppPqaCheckList2.location, thirdColumnStartPoint2 + 22, rowY - 1.5, {}, false, 12);

    rowY += 8.8;
    createText('(10%)', 159.5, rowY, {}, false, 10);

    rowY += 61.9;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(176.4 - lastColumnWidth2, rowY, lastColumnWidth2, 7);
    rowY += 4.8;
    createText('Score', 176.4 - lastColumnWidth2 - 13.3, rowY, {}, false, 12);
    createText(trade2Score.toString(), 176.4 - lastColumnWidth2 / 2 - 3, rowY, {}, true, 12);
    rowY += 5;

    //#endregion trade 2 table

    //#region trade 3 table
    doc.rect(xStart, rowY, 164.4, 6);
    rowY += 6;

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

    let secondColumnStartPoint3;
    let lastColumnWidth3;
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
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: '#fff',
        valign: 'top',
        halign: 'center',
        minCellHeight: 10,
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'left', minCellWidth: 46 },
        2: { halign: 'center' },
        3: { halign: 'left', minCellWidth: 56 },
        4: { halign: 'center' },
      },
      didDrawCell: function (data) {
        lastColumnWidth3 = data.table.columns[4].width;
        secondColumnStartPoint3 = xStart + data.table.columns[0].width;
      },
    });

    createText('3', xStart + 4, rowY - 1.5, {}, true, 12);
    createText('Follow-up on site QA/QC observations:', secondColumnStartPoint3 + 1, rowY - 1.5, {}, true, 10);
    createText('(select 3 from previous month to verify)', secondColumnStartPoint3 + 67, rowY - 1.5, {}, false, 10);

    rowY += 8.8;
    createText('(15%)', 159.5, rowY, {}, false, 10);

    rowY += 24;
    doc.setLineWidth(0.3);
    doc.setDrawColor('#000000');
    doc.rect(176.4 - lastColumnWidth3, rowY, lastColumnWidth3, 7);
    rowY += 4.8;

    createText('Score', 176.4 - lastColumnWidth3 - 13.3, rowY, {}, false, 12);
    createText(observationScore.toString(), 176.4 - lastColumnWidth3 / 2 - 3, rowY, {}, true, 12);
    rowY += 5;
    //#endregion trade 3 table

    //#region trade 4 table
    const { yes, partial, no, na, total_findings } = subAppPqaLastMonthFinding.scoreList;
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 25);
    rowY += 6;
    createText('4', xStart + 4, rowY, {}, true, 12);
    createText('Follow-up on last month PQA findings', secondColumnStartPoint3 + 1, rowY, {}, true, 10);
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText('(15%)', 160, rowY + 2, {}, false, 10);
    rowY += 4;
    doc.rect(xStart, rowY, 10, 15);
    doc.rect(xStart + 10, rowY, 154.4, 15);
    rowY += 10;
    createText('4.1', xStart + 2, rowY, {}, false, 12);
    createText('Total', xStart + 12, rowY - 2.5, {}, false, 12);
    createText('Findings', xStart + 12, rowY + 2.5, {}, false, 12);
    createText(':', xStart + 30, rowY, {}, false, 12);
    createText(total_findings.toString(), xStart + 34, rowY, {}, false, 12);
    createText('Yes', xStart + 50, rowY, {}, false, 12);
    createText(':', xStart + 58, rowY, {}, false, 12);
    createText(yes.toString(), xStart + 61, rowY, {}, false, 12);
    createText('Partial', xStart + 76, rowY, {}, false, 12); //+15
    createText(':', xStart + 88, rowY, {}, false, 12);
    createText(partial.toString(), xStart + 92, rowY, {}, false, 12); //+4
    createText('No', xStart + 107, rowY, {}, false, 12); //+15
    createText(':', xStart + 113, rowY, {}, false, 12);
    createText(no.toString(), xStart + 116, rowY, {}, false, 12); //+4
    createText('NA', xStart + 128, rowY, {}, false, 12); //+15
    createText(':', xStart + 134, rowY, {}, false, 12);
    createText(no.toString(), xStart + 138, rowY, {}, false, 12); //+4
    createText(lastMonthPqaScore.toString(), xStart + 150, rowY, {}, true, 12); //+12
    //#endregion trade 4 table

    //#region trade 5 table
    rowY += 8;
    doc.rect(xStart, rowY, 164.4, 10);
    doc.line(154.4, rowY, 154.4, rowY + 10);
    doc.rect(154.4, rowY + 10, 22, 8);

    rowY += 6;
    createText('5', xStart + 4, rowY, {}, true, 12);
    createText('Site findings - detailed report (next page) ', secondColumnStartPoint3 + 1, rowY, {}, true, 10);
    createText('Weightage', 157, rowY - 2, {}, false, 10);
    createText('(50%)', 160, rowY + 2, {}, false, 10);
    rowY += 10;
    createText(findingScore.toString(), 162, rowY, {}, true, 12);
    createText('Score', 140, rowY, {}, false, 12);

    //#endregion trade 5 table

    //Third page

    addNewPage();

    const rowsDataTrade5InOnePage = [[]];
    const pointListTrade5InOnePage = [[]];
    const imageList = [[]];

    // const imageList = [
    //   [
    //     [whLogo, whLogo, whLogo],
    //     [whLogo, whLogo],
    //     [whLogo, whLogo, whLogo],
    //     [whLogo, whLogo],
    //   ],
    //   [
    //     [whLogo, whLogo],
    //     [whLogo, whLogo],
    //     [whLogo, whLogo],
    //     [whLogo, whLogo],
    //   ],
    //   [[whLogo, whLogo]],
    // ];

    let pageNumber = 0;
    subAppPqaFinding.forEach((findings, index) => {
      if (index > 0 && index % 4 === 0) {
        //Divide to group 4 findings in one page
        pageNumber++;
        rowsDataTrade5InOnePage.push([]);
        pointListTrade5InOnePage.push([]);
        imageList.push([]);
      }

      rowsDataTrade5InOnePage[pageNumber].push([(index + 1).toString(), findings.findingReport]);
      pointListTrade5InOnePage[pageNumber].push({
        severityPoint: findings.severityPoint,
        frequencyPoint: findings.frequencyPoint,
        points: findings.points,
      });
      //convert list Image to base64
      findings.findingImage.forEach(async (image, index) => {
        findings.findingImage[index] = await getBase64(image);
      });
      imageList[pageNumber].push(findings.findingImage);
      console.log(findings.findingImage);
    });

    const createTrade5Page = (rowsDataTrade5, pointListTrade5, imageListDetail, index) => {
      doc.autoTable({
        head: [
          [
            { content: 'S/N', colSpan: 1 },
            { content: 'Findings', colSpan: 1 },
          ],
        ],
        body: rowsDataTrade5,
        startY: rowY,
        margin: { left: xStart },
        theme: 'grid',
        styles: {
          fontStyle: 'normal',
          textColor: '#000',
          lineColor: '#000',
          lineWidth: 0.2,
        },
        headStyles: { fillColor: '#fff', valign: 'middle', halign: 'left' },
        columnStyles: {
          0: { minCellWidth: 10, valign: 'middle', halign: 'center' },
          1: { minCellWidth: 154, cellPadding: { top: 1, right: 28.5, botton: 1, left: 1 } },
        },
        bodyStyles: {
          minCellHeight: 56,
        },
        didDrawCell: function (data) {},
      });

      const insertImage = (index, rowY) => {
        imageListDetail[index][0] && doc.addImage(imageListDetail[index][0], 'JPEG', 23.5, rowY - 37, 45, 35);
        imageListDetail[index][1] && doc.addImage(imageListDetail[index][1], 'JPEG', 73.5, rowY - 37, 45, 35);
        imageListDetail[index][2] && doc.addImage(imageListDetail[index][2], 'JPEG', 123.5, rowY - 37, 45, 35);
      };
      rowY = 36.6;
      pointListTrade5.forEach((score, index) => {
        doc.setLineWidth(0.3);
        doc.setDrawColor('#000000');
        doc.rect(148.9, rowY, 27.5, 16);
        rowY += 4;
        createTextItalic('Severity:', 150, rowY, {}, 10);
        createText(score.severityPoint.toString(), 170, rowY, {}, false, 10);
        rowY += 5;
        createTextItalic('Frequency:', 150, rowY, {}, 10);
        createText(score.frequencyPoint.toString(), 170.5, rowY, {}, false, 10);
        rowY += 5;
        createTextItalic('Points:', 150, rowY, {}, 10);
        createText(score.points.toString(), 170, rowY, {}, false, 10);
        rowY += 42; //98.6
        insertImage(index, rowY);
      });
    };

    rowsDataTrade5InOnePage.forEach((rowData, index) => {
      const pointListTrade5 = pointListTrade5InOnePage[index];
      const imageListDetail = imageList[index];

      createTrade5Page(rowData, pointListTrade5, imageListDetail, index);
      if (index < rowsDataTrade5InOnePage.length - 1) {
        addNewPage();
      }
    });

    async function uploadObjectToS3Bucket(objectName, objectData) {
      fs.writeFileSync('/tmp/pc.pdf', objectData);
      const fileContent = fs.readFileSync('/tmp/pc.pdf');
      const params = {
        Bucket: BUCKET_NAME,
        Key: `prefab/subapp/pqa/${objectName}`,
        Body: fileContent,
      };
      await s3bucket.upload(params).promise();
    }

    const arrayBuffer = doc.output('arraybuffer');
    let bf = Buffer.from(arrayBuffer);
    const key = `pdf-form/${event?.id}.pdf`;
    await uploadObjectToS3Bucket(key, bf);
    return key;
  } catch (err) {
    console.log(err.message);
    return null;
  }
};
