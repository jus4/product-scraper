const { climbingShoeVariation } = require('../models');

const ShoeVariationController = {

    async index(req,res) {
        const resPerPage = 8;
        const page = req.query.page < 1 ? 1 : req.query.page;


        // TODO add error repostin if model or shop does not exist
        const hasShoeModel = req.query.hasOwnProperty('shoeModel') && req.query.shoeModel !== 'unset';
        const hasShop = req.query.hasOwnProperty('shop') && req.query.shop !== 'unset';

        let filter = {};
        if(hasShoeModel) {
            filter.model = req.query.shoeModel;
        }
        if(hasShop) {
            filter.shop = req.query.shop;
        }

        await climbingShoeVariation.find(filter)
        .populate('model shop')
        .sort({'model' : 'desc'})
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .exec( function(err, found) {
            if (err) console.log(err)
            const shoes = found.map( (element) => {
                return {
                    size: element.sizes,
                    shop: element.shop.name,
                    updatedAt: element.updatedAt,
                    model: element.model.model,
                    price: element.price,
                    source: element.source
                };
            })

            res.status(200).json(shoes);
        })
        
    }
}

module.exports = ShoeVariationController;