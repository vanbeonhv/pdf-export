const Header = {
  TRADE_1: 0,
  TRADE_2: 1,
  OBSERVATION: 2,
  PQA: 3,
  RFWI: 4,
  FINDING: 5,
  OVERALL: 6
};

const getSecondLineText = (columnIndex) => {
  switch (columnIndex) {
    case Header.TRADE_1:
      return '(10%)';

    case Header.TRADE_2:
      return '(10%)';

    case Header.OBSERVATION:
      return 'Follow-up';

    case Header.PQA:
      return 'Follow-up';

    case Header.RFWI:
      return 'Records';

    case Header.FINDING:
      return '(50%)';

    case Header.OVERALL:
      return '';

    default:
      return '';
  }
};

module.exports = {
  getSecondLineText
};
