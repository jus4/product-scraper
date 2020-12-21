const { Manufacturer } = require('../models');

const ManufacturerController = {
    async index(req,res) {
        const manufacturers = await Manufacturer.find();
        
        res.status(200).json(manufacturers);
    }
}

module.exports = ManufacturerController;