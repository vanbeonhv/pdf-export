const getWeightage = (tradeNumber) => {
  switch (tradeNumber) {
    case 1:
      return 10;
    case 2:
      return 10;
    case 3:
      return 10;
    case 4:
      return 10;
    case 5:
      return 10;
    case 7:
      return 50;
    default:
      return 9999;
  }
};

module.exports = {
  getWeightage
};
