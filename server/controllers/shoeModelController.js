const { climbingShoeModel } = require('../models');

const ShoeModelController = {

    async index(req,res) {
        let models = await climbingShoeModel.find({}, function(err, document) {
            if (err) res.status(500).send('Invalid error');
        })
        models = models.map((model) => {
            return {name: model.model, id: model._id, itemCount: model.shoeCollection.length}
        })

        res.status(200).json(models);
    },

    async modelCollectionById( req, res) {
        const collection = await climbingShoeModel.findById( req.params.id, function(err, document) {
            if (err) res.status(500).send('Invalid id')
        }).populate('shoes')        
        .exec(function(err,found){
            if(err) res.status(500).send('invalid ID');
            else{
                console.log(found);
                res.status(200).json(found);       
            }
        })
    } 

}

module.exports = ShoeModelController;