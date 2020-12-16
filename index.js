const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const scrapers = require('./server/scrapers');
const shopItems = require('./shopItems.json');
const cron = require('node-cron');
const path = require('path');
const Queue = require('bull');
const {Shop, climbingShoeModel, climbingShoeVariation } = require('./server/models');

mongoose.connect('mongodb://localhost/productScraper', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Mongo db connected');
});

const scrapeProcessData = new Queue('scrapedata', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  }
});

scrapeProcessData.on('completed', job => {
  console.log(`Job with id ${job.id} has been completed. Product ${job.data.model}`);
})

scrapeProcessData.process(path.resolve(__dirname, './server/prosessors/scrapeShoes.js'));
cron.schedule('45,30,50 8-20 * * *', async function(){
  for( let i = 0; i < shopItems.length; i++) {
    const data = shopItems[i];
    const options = {
      delay: 100, // 1 min in ms
      attempts: 2
    };
    scrapeProcessData.add(data, options);
  }
});

app.use(cors());
require('./server/routes')(app);

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});