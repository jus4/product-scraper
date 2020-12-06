const express = require('express');
const router = express.Router();

module.exports = function(app) {
    router.get('/epictv/:url', async function(req,res) {
        res.response('Api works');
    })


    app.use('/api', router);
};