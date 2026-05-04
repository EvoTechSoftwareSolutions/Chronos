const dashboardController = require('../controllers/dashboardController');

async function testController() {
  const req = {};
  const res = {
    status: (code) => {
      console.log('Status:', code);
      return {
        json: (data) => console.log('JSON:', JSON.stringify(data, null, 2))
      };
    }
  };
  await dashboardController.getDashboardStats(req, res);
  process.exit();
}

testController();
