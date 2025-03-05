const convertScoreToClose = (score, isActive) => {
  switch (score) {
    case 5:
      return 'Yes';
    case 2.5:
      return 'Partial';
    case 0:
      return isActive ? 'No' : '-';
    case 99:
      return '-';
    default:
      return '';
  }
};

let conform = '';
const getClose = (scoreList, isActive = true) => {
  const closeList = [];
  scoreList.forEach((score) => {
    conform = convertScoreToClose(score, isActive);
    closeList.push(conform);
  });
  return closeList;
};

module.exports = {
  getClose
};
