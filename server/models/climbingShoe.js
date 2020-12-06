const mongoose = require('mongoose');

const shoeVariation = new mongoose.Schema({
    price: Number,
    sizes: [],
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
    },
    source: String,
}, { timestamps: true })
const climbingShoeVariation = mongoose.model('ClimbingShowVariation', shoeVariation);


const climbingShoeModelSchema = new mongoose.Schema({
    model: {
        type: String,
        unique: true,
    },
    shoeCollection: [
        { type: mongoose.Schema.Types.ObjectId}
    ],
});
const climbingShoeModel = mongoose.model('ClimbingShoeModel', climbingShoeModelSchema);

module.exports = {
    climbingShoeVariation,
    climbingShoeModel
}