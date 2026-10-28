const app = require('./app');
const seedData = require('./seedData');

const PORT = process.env.PORT || 5000;

seedData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Server startup error:', err);
});
