const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const scrapers = require('./server/scrapers');
const shopItems = require('./shopItems.json');
const {Shop, climbingShoeModel, climbingShoeVariation } = require('./server/models');
const shop = require('./server/models/shop');

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

async function getShoeLabel(label) {
  const shoeLabel = await climbingShoeModel.findOne({ model: label});
  if (shoeLabel) {
    return shoeLabel
  }
  const newShoeLabel = new climbingShoeModel({
    model: label,
    shoeCollection: []
  })
  newShoeLabel.save( function(err, document) {
    if (err) {
      console.log(err);
    }
    console.log(document);
  })


  return newShoeLabel;
}


async function getShop(name) {
  const shop = await Shop.findOne({name: name});
  if (shop) {
    return shop
  }
  const newShop = new Shop({
    name: name,
    shoes: [],
  })

  newShop.save( function(err, document) {
    if (err) console.log(err)
    console.log(document);
  } )

  return newShop
}

const scrapedData = [];
shopItems.forEach( async (shopItem) => {
    scrapedData.push(scrapers[shopItem.scraper].scrape(shopItem.url))
});

Promise.all(scrapedData).then( function(response) {
  //console.log(response[0]);
  let interval = 10 * 100; // 10 seconds;
  for (let i = 0; i <=  response.length - 1 ; i++) {
    setTimeout( async function (i) {
      
      const shop = await getShop(shopItems[i].shop);
      const shoeLabel = await getShoeLabel(shopItems[i].model);

      const variationOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
      const shoeVariationUpdate = {
        price: response[i].price,
        sizes: response[i].sizes,
        shop: shop._id,
        source: shopItems[i].url
      }
      await climbingShoeVariation.findOneAndUpdate( {source: shopItems[i].url},shoeVariationUpdate, variationOptions, function(err, document) {
        if (err) return
        }).then( async function(document) {
          const modelOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
          const modelUpdate = {
            $addToSet: {shoeCollection: document._id}
          }
          await climbingShoeModel.findOneAndUpdate( {model: shopItems[i].model}, modelUpdate, modelOptions, function( err, document) {
            if (err) console.log(err)
            console.log(document);
          })

          const shopOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
          const shoplUpdate = {
            $addToSet: {shoes: document._id}
          }
          await Shop.findOneAndUpdate( {name: shopItems[i].shop}, shoplUpdate, shopOptions, function( err, document) {
            if (err) console.log(err)
            console.log(document);
          })

      })


    }, interval * i, i);


  }
})



   
  // await shoeLabel.save()
  //   .then( async (result) => {
  //     await Shop.findById(shop._id, (err, shop) => {
  //       if(shop) {
  //         shop.shoes.push(shoeLabel);
  //         shop.save();
  //       }
  //     })
  //   })






app.use(cors());
require('./server/routes')(app);


//Promise.all([ 
//  scrapers.epicTvShoeScraper.scrape(
//    'https://shop.epictv.com/en/climbing-shoes/scarpa/instinct-vsr-climbing-shoe?sku=SCAW17_CLSHINVSR_35',
//    'Scarpa'
//  ),
//  //scrapers.epicTv.scrape(),
//  //scrapers.bergfreunde.scrape(),
//  //scrapers.trekkin.scrape(),
//  //scrapers.epicTvScarpa.scrape() 
//  ]).then((values) => {
//      console.log(values[0].history);
//  });

const PORT = 9000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});