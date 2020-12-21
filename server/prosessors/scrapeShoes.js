const {Shop, climbingShoeModel, climbingShoeVariation, Manufacturer } = require('../models');
const scrapers = require('../scrapers');
const mongoose = require('mongoose'); // Mongoose needs to be reinitialize on jobs in order to work
mongoose.connect('mongodb://localhost/productScraper', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

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

async function getShoeVariation(url) {
    
  const shoeVariation = await climbingShoeVariation.findOne({ source: url});
  if (shoeVariation) {
    return shoeVariation
  }
  const newShoeVariation = new climbingShoeVariation({
      source: url,
  })
  newShoeVariation.save( function(err, document) {
    if (err) {
      console.log(err);
    }
    console.log(document);
  })


  return newShoeVariation;
}

async function getManufacturer(name) {
    
  const manufacturer = await Manufacturer.findOne({ name: name});
  if (manufacturer) {
    return manufacturer
  }
  const newManufacturer = new Manufacturer({
      name: name,
  })
  newManufacturer.save( function(err, document) {
    if (err) {
      console.log(err);
    }
    console.log(document);
  })


  return newManufacturer;
}

module.exports = async job => {

        const scrapedData = await scrapers[job.data.scraper].scrape(job.data.url); // Get scraped  data

        const shop = await getShop(job.data.shop);
        const shoeModel = await getShoeLabel(job.data.model);
        const shoeVariation = await getShoeVariation(job.data.url);
        const manufacturer = await getManufacturer(job.data.manufacturer);

        Promise.all([scrapedData, shop, shoeModel,shoeVariation, manufacturer]).then( async function(response) {
            const data = response[0];
            const shop = response[1];
            const shoeModel = response[2];
            const shoeVariation = response[3];
            const manufacturer = response[4];

            console.log(manufacturer);

            const shoeLabelUpdate = {
                $addToSet: {shoeCollection: shoeVariation._id},
                manufacturer: manufacturer._id
            }
            const modelOptions = { new: true };
            await climbingShoeModel.findByIdAndUpdate(shoeModel._id, shoeLabelUpdate, modelOptions, function(err, document) {
                if (err) console.log(err)
            })
            
            const shopOptions = { new: true};
            const shoplUpdate = {
              $addToSet: {shoes: shoeVariation._id}
            }
            await Shop.findByIdAndUpdate( shop._id, shoplUpdate, shopOptions, function( err, document) {
              if (err) console.log(err)
                }).then( async function() {
                    // Update show variations
                    const shoeVariationUpdate = {
                      price: data.price,
                      sizes: data.sizes,
                      shop: shop._id,
                      model: shoeModel._id,
                      manufacturer: manufacturer._id
                    }
                    const variationOptions = { new: true };
                    await climbingShoeVariation.findByIdAndUpdate(shoeVariation._id, shoeVariationUpdate, variationOptions, 
                        function(err, documet) {
                        if (err) console.log(err)
                    })
                })
            
            return scrapedData;
        })


}