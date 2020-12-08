const {Shop } = require('../models');

const ShopsController = {

    async index(req, res) {
        const shops = await Shop.find({});
        const shopsIds = shops.map( shop => {
            return {name: shop.name, id: shop._id}  
        })
        res.json(shopsIds);
    },

    async shopById(req, res) {
        const details = await Shop.findById( req.params.id, function(err, document) {
            if (err) res.status(500).send('invalid ID');
        }); 
        res.status(200).json(details);       
    },

    async shopShoesById(req, res) {
        const details = await Shop.findById( req.params.id, function(err, document) {
            if (err) res.status(500).send('invalid ID');
        }).populate({
            path:'shoes',
            populate: {
                path: 'model',
            }
        })
        .exec(function(err,found){
            if(err) res.status(500).send('invalid ID');
            else{
                console.log(found);
                res.status(200).json(found.shoes);       
            }
        })
    }
}

module.exports = ShopsController;