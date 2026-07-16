const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/POST/authenVmanage', {
      ip: '172.26.157.1',
      username: 'admin',
      password: 'password'
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
