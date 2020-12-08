const { climbingShoeModel } = require('../models');

const ShoeModelController = {

    async index(req,res) {
        const models = await climbingShoeModel.find({}, function(err, document) {
            if (err) res.status(500).send('Invalid error');
        })
        console.log(models);
        res.status(200).json(models);
    }

}

module.exports = ShoeModelController;