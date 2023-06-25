const convertScoreToConform = (score) => {
  switch (score) {
    case 10:
      return 'Yes';
    case 0:
      return 'No';
    default:
      return 'NA';
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
  getConform,
};
