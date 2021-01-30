const mongoose = require('mongoose');

const shoeVariation = new mongoose.Schema({
    price: Number,
    sizes: [],
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    },
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClimbingShoeModel',
    },
    manufacturer: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manufacturer'
    },
    source: {
        type:String,
        unique:true 
    }
}, { timestamps: true })
const climbingShoeVariation = mongoose.model('ClimbingShowVariation', shoeVariation);

const manufacturer = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    products: [
        { type: mongoose.Schema.Types.ObjectId}
    ]
})

const Manufacturer = mongoose.model('Manufacturer', manufacturer);


const climbingShoeModelSchema = new mongoose.Schema({
    model: {
        type: String,
        unique: true,
    },
    shoeCollection: [
        { type: mongoose.Schema.Types.ObjectId}
    ],
    manufacturer: { 
        type: mongoose.Schema.Types.ObjectId,
    //    unique: true
    }
});
const climbingShoeModel = mongoose.model('ClimbingShoeModel', climbingShoeModelSchema);

module.exports = {
    climbingShoeVariation,
    climbingShoeModel,
    Manufacturer
}
