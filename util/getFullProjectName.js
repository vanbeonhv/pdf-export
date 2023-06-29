const getFullProjectName = (ProjectCode) => {
  switch (ProjectCode) {
    case 'PDD':
      return `Punggol Digital District (${ProjectCode.toUpperCase()})`;
    case 'KCDE':
      return ` Kim Chuan Depot Extension (${ProjectCode.toUpperCase()})`;
    case 'TGW':
      return `Tengah garden walk (${ProjectCode.toUpperCase()})`;
    case 'IWB':
      return `Irwell Bank (${ProjectCode.toUpperCase()})`;
    default:
      return `  (${ProjectCode.toUpperCase()})`;
  }
};

module.exports = {
  getFullProjectName,
};
