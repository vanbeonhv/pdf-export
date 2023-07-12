const convertScoreToConform = (score) => {
  switch (score) {
    case 10:
      return 'Yes';
    case 0:
      return 'No';
    case 99:
      return 'NA';
    default:
      return 'Null';
  }
};

let conform = '';
const getConform = (scoreList) => {
  const conformList = [];
  scoreList.forEach((score) => {
    conform = convertScoreToConform(score);
    conformList.push(conform);
  });
  return conformList;
};

module.exports = {
  getConform
};
