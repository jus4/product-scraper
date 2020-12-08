const mongoose = require('mongoose');

const shop = new mongoose.Schema({
    name: {
        type:String,
        unique: true,
    },
    shoes: [{type: mongoose.Schema.Types.ObjectId, ref: 'ClimbingShowVariation',}],
});

module.exports = mongoose.model('Shop', shop);