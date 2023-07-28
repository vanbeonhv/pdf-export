// const axios = require('axios');

// const getFullProjectName = async (projectId, token) => {
//   try {
//     const res = await axios.get('https://api.whidd.com/projects', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     const projectList = res.data.data;
//     const projectName = getProjectNameByProjectId(projectId, projectList);
//     const projectFullName = getFullName(projectName);
//     return projectFullName;
//   } catch (error) {
//     console.log(error.message);
//     return null;
//   }
// };

// const getProjectNameByProjectId = (projectId, projectList) => {
//   const projectById = projectList.find((project) => project.id === projectId);
//   return projectById.name;
// };

//original func's name: getFullName
const getFullProjectName = (ProjectName) => {
  switch (ProjectName) {
    case 'PDD':
      return `Punggol Digital District (${ProjectName.toUpperCase()})`;
    case 'KCDE':
      return ` Kim Chuan Depot Extension (${ProjectName.toUpperCase()})`;
    case 'TGW':
      return `Tengah garden walk (${ProjectName.toUpperCase()})`;
    case 'IWB':
      return `Irwell Hill Residences (${ProjectName.toUpperCase()})`;
    case 'CR106':
      return `CRL106 Loyang Station `;
    default:
      return `  (${ProjectName.toUpperCase()})`;
  }
};

module.exports = {
  getFullProjectName
};
