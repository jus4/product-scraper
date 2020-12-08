const express = require('express');
const router = express.Router();

const {
    ShopsController,
    ShoeModelController
} = require('./controllers');

module.exports = function(app) {
    router.get('/shops', ShopsController.index); 
    router.get('/shops/:id', ShopsController.shopById);
    router.get('/shop/shoes/:id', ShopsController.shopShoesById);

    router.get('/shoes/models', ShoeModelController.index)

    app.use('/api', router);
};