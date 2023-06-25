const convertScoreToClose = (score) => {
  switch (score) {
    case 5:
      return 'Yes';
    case 2.5:
      return 'No';
    case 0:
      return 'NA';
    default:
      return '';
  }
};

let conform = '';
const getClose = (scoreList) => {
  const conformList = [];
  scoreList.forEach((score) => {
    conform = convertScoreToClose(score);
    conformList.push(conform);
  });
  return conformList;
};

module.exports = {
  getClose,
};
