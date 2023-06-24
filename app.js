const { jsPDF } = require('jspdf');
const { fetchPqaData } = require('./fetchPqaData');
const { exec } = require('child_process');
const { fs } = require('fs');
const { convertFont } = require('./convertFont');
const dayjs = require('dayjs');

// fetchPqaData('8e6251a4-49f6-4552-8b1c-73302519d6aa')
//   .then((data) => {
//     generatePdf(data);
//   })
//   .catch((error) => {
//     console.error('Error generating PDF:', error);
//   });

const { pqaDetail, fontData, whLogo } = require('./demoData');
// convertFont();

const generatePdf = (pqaDetail) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [190.5, 275.2]
  });

  const createText = (
    text,
    x,
    y,
    options,
    isBold = false,
    fontSize = 9,
    textColor = 'black',
    backgroundColor = ''
  ) => {
    doc?.setFontSize(fontSize);
    doc?.setTextColor(textColor);
    doc?.setFont(undefined, !isBold ? 'normal' : 'bold');
    if (backgroundColor) doc.setTextColor(backgroundColor);
    doc?.text(text, x, y, options);
  };

  doc.addFileToVFS('FiraSans.ttf', fontData);
  doc.addImage(whLogo, 'JPEG', 45, 55, 100, 30);
  createText('Project Quality Audit', 40, 105, {}, true, 32);
  createText('Project:', 40, 128, {}, false, 22);
  createText(pqaDetail.projectCode.toUpperCase(), 80, 128, {}, false, 18);
  createText('Audit Date:', 40, 148, {}, false, 22);
  createText(
    dayjs(pqaDetail.createdDate).format('DD-MMM-YYYY'),
    80,
    148,
    {},
    false,
    18
  );
  createText('Audited by:', 40, 168, {}, false, 22);
  createText(pqaDetail.name, 80, 168, {}, false, 18);
  doc.save('output.pdf');

  exec('start output.pdf');
  console.log(pqaDetail);
  // return pqaDetail;
};

generatePdf(pqaDetail);
