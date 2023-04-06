const { currencyService } = require('../services');

async function getExchangeRates(req, res) {
    try {
        let centralBankCode = req.query.centralBankCode;
        if (centralBankCode) {
            let centralBankCodeIsSupported = currencyService.isCentralBankCodeSupported(centralBankCode);
            if (centralBankCodeIsSupported) {
                // ok, move on
            } else {
                throw new Error(`centralBankCode "${centralBankCode}" is not supported`);
            }
        } else {
            centralBankCode = currencyService.getDefaultCentralBankCode();
        }

        let exchangeRatesData = await currencyService.getActualExchangeRates({
            "centralBankCode": centralBankCode
        });

        let actualExchangeRates = exchangeRatesData.actualExchangeRates,
            actualFor = exchangeRatesData.actualFor,
            baseCurrency = exchangeRatesData.baseCurrency;

        let actualForString = actualFor.format("DD.MM.YYYY");

        res.send({
            "success": true,
            "rates": actualExchangeRates,
            "baseCurrency": baseCurrency,
            "centralBankCode": centralBankCode,
            "actualFor": actualForString
        });
    } catch (err) {
        console.error(err);

        res.send({
            "success": false,
            "error": err.message
        });
    }
}

async function getConversion(req, res) {
    try {
        let fromCurrency = req.query.from,
            toCurrency = req.query.to,
            amountString = req.query.amount;

        if (!fromCurrency) {
            throw new Error("from is empty");
        } else if (!toCurrency) {
            throw new Error("to is empty");
        } else if (!amountString) {
            throw new Error("amount is empty");
        }

        let amount = Number(amountString);
        if (Number.isNaN(amount)) {
            throw new Error(`can't convert amount "${amount}"`);
        }

        let centralBankCode = req.query.centralBankCode;
        if (centralBankCode) {
            let centralBankCodeIsSupported = currencyService.isCentralBankCodeSupported(centralBankCode);
            if (centralBankCodeIsSupported) {
                // ok, move on
            } else {
                throw new Error(`centralBankCode "${centralBankCode}" is not supported`);
            }
        }

        let conversionData = await currencyService.convertCurrencies({
            "fromCurrency": fromCurrency,
            "toCurrency": toCurrency,
            "amount": amount,
            "centralBankCode": centralBankCode
        });

        let conversionResult = conversionData.result,
            conversionActualFor = conversionData.actualFor,
            conversionCentralBankCode = conversionData.centralBankCode;

        let conversionActualForString = conversionActualFor.format("DD.MM.YYYY");

        res.send({
            "success": true,
            "amount": amount,
            "from": fromCurrency,
            "to": toCurrency,
            "result": conversionResult,
            "centralBankCode": conversionCentralBankCode,
            "actualFor": conversionActualForString
        });
    } catch (err) {
        console.error(err);

        res.send({
            "success": false,
            "error": err.message
        });
    }
}

module.exports = {
    getExchangeRates,

    getConversion
};
