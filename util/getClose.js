const convertScoreToClose = (score) => {
  switch (score) {
    case 5:
      return 'Yes';
    case 0:
      return 'No';
    case 99:
      return 'NA';
    default:
      return '';
  }
};

let conform = '';
const getClose = (scoreList) => {
  const closeList = [];
  scoreList.forEach((score) => {
    conform = convertScoreToClose(score);
    closeList.push(conform);
  });
  return closeList;
};

module.exports = {
  getClose
};
