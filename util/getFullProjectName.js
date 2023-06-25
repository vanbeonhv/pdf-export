const getFullProjectName = (projectCode) => {
  switch (projectCode) {
    case 'pdd':
      return `Punggol Digital District (${projectCode.toUpperCase()})`;
    case 'kcde':
      return ` Kim Chuan Depot Extension (${projectCode.toUpperCase()})`;
    case 'tgw':
      return `Tengah garden walk (${projectCode.toUpperCase()})`;
    case 'iwb':
      return `Irwell Bank (${projectCode.toUpperCase()})`;
    default:
      return `  (${projectCode.toUpperCase()})`;
  }
};

module.exports = {
  getFullProjectName,
};
