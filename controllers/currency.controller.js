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
            actualFor = exchangeRatesData.actualFor;

        let actualForString = actualFor.format("DD.MM.YYYY");

        res.send({
            "success": true,
            "info": actualExchangeRates,
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

        let fromCurrencyIsSupported = await currencyService.isCurrencySupported(fromCurrency);
        if (fromCurrencyIsSupported) {
            // ok, move on
        } else {
            throw new Error(`currency with code "${fromCurrency}" is not supported`);
        }

        let toCurrencyIsSupported = await currencyService.isCurrencySupported(toCurrency);
        if (toCurrencyIsSupported) {
            // ok, move on
        } else {
            throw new Error(`currency with code "${toCurrency}" is not supported`);
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

        let conversionResult = await currencyService.convertCurrencies({
            "fromCurrency": fromCurrency,
            "toCurrency": toCurrency,
            "amount": amount,
            "centralBankCode": centralBankCode
        });

        let conversionValue = conversionResult.value,
            conversionActualFor = conversionResult.actualFor,
            conversionCentralBankCode = conversionResult.centralBankCode;

        let actualForString = actualFor.format("DD.MM.YYYY");

        res.send({
            "success": true,
            "value": conversionValue,
            "centralBankCode": conversionCentralBankCode,
            "actualFor": conversionActualFor
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
