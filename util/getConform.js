const convertScoreToConform = (score, isActive) => {
  switch (score) {
    case 10:
      return 'Yes';
    case 0:
      return isActive ? 'No' : '-';
    case 99:
      return 'NA';
    default:
      return 'Null';
  }
};

let conform = '';
const getConform = (scoreList, isActive = true) => {
  const conformList = [];
  scoreList.forEach((score) => {
    conform = convertScoreToConform(score, isActive);
    conformList.push(conform);
  });
  return conformList;
};

module.exports = {
  getConform
};
