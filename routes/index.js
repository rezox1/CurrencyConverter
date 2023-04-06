const express = require('express');

const { currencyController } = require('../controllers');

const router = express.Router();

router.get('/exchangeRates', currencyController.getExchangeRates);

router.get('/convert', currencyController.getConversion);

module.exports = router;
