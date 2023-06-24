const axios = require('axios');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYjEzZTM5MC1kYWExLTQzODUtOTdjNi02ZGFlYzI1ZTVjMTkiLCJpc0FkbWluIjpmYWxzZSwiZW1haWwiOiJuZ3V5ZW5faHV1dmFuQHdvaGh1cC5jb20udm4iLCJjb25maXJtZWQiOmZhbHNlLCJuYW1lIjoiTmd1eWVuIEh1dSBWYW4iLCJzaG9ydE5hbWUiOm51bGwsImlhdCI6MTY4NzQ4NTA0OCwiZXhwIjoxNjg3NTcxNDQ4fQ.lSDFrDxrJAivym0CTgY-XKEf9VZqtxoLYFqd7pXiKy0';

const fetchPqaData = async (id) => {
  try {
    const res = await axios.get(`http://localhost:8009/api/subapp/pqa/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
};

module.exports = {
  fetchPqaData
};
