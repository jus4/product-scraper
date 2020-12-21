const express = require('express');
const router = express.Router();

const {
    ShopsController,
    ShoeModelController,
    ShoeVariationController,
    ManufacturerController
} = require('./controllers');
const manufacturerController = require('./controllers/manufacturerController');

module.exports = function(app) {
    router.get('/shops', ShopsController.index); 
    router.get('/shops/:id', ShopsController.shopById);
    router.get('/shop/shoes/:id', ShopsController.shopShoesById);

    router.get('/shoes/models', ShoeModelController.index)

    router.get('/shoes/variations', ShoeVariationController.index)

    router .get('/manufacturers', ManufacturerController.index)

    app.use('/api', router);
};