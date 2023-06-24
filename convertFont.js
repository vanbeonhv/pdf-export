const fs = require('fs');
const base64 = require('base64-js');

const convertFont = () => {
  const fontPath = './fonts/FiraSans-Black.ttf'; // Replace with the actual path to the font file

  const fontData = fs.readFileSync(fontPath);
  const fontBase64 = base64.fromByteArray(new Uint8Array(fontData));

  fs.writeFileSync('./fonts/fira-sans-black.base64.txt', fontBase64);
};

module.exports = {
  convertFont
};
