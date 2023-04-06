const dayjs = require('dayjs');

const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const schedule = require('node-schedule');

const axios = require('axios');

const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser;

const CENTRAL_BANK_CODE = "thai";

const BASE_CURRENCY_CODE = "thb";

let actualExchangeRatesDataReceived = getActualExchangeRatesData();

const refreshExchangeRates = schedule.scheduleJob("*/5 * * * *", async () => {
    try {
        let newExchangeRates = await getActualExchangeRatesData();

        actualExchangeRatesDataReceived = newExchangeRates;
    } catch (err) {
        console.error(err);
    }
});

function getCode() {
    return CENTRAL_BANK_CODE;
}

async function getActualExchangeRatesData() {
    const GET_EXCHANGE_DATA_URL = "https://www.bot.or.th/App/RSS/fxrate-all.xml";

    let {"data": xmlWithExchangeRates} = await axios.get(GET_EXCHANGE_DATA_URL);

    let parsedXmlData = await xmlParser.parseStringPromise(xmlWithExchangeRates);

    let actualForString = parsedXmlData["rdf:RDF"]['channel'][0]['dc:date'][0];

    let actualFor = dayjs(actualForString, "YYYY-MM-DD");

    let rawExchangeRates = parsedXmlData["rdf:RDF"]['item'];

    let exchangeRates = {};

    for (let rawExchangeRateData of rawExchangeRates) {
        let exchangeRateTitle = rawExchangeRateData['title'][0];

        if (exchangeRateTitle.includes("Buying Transfer") || exchangeRateTitle.includes("Buying Rate")) {
            let currencyToPayString =  rawExchangeRateData['cb:value'][0]['_'];

            let currencyToPay = Number(currencyToPayString);

            let currencyCodeToSell = rawExchangeRateData['cb:targetCurrency'][0];

            let preparedCurrencyCodeToSell = currencyCodeToSell.toLowerCase();

            let exchangeCombination =  preparedCurrencyCodeToSell + ":" + BASE_CURRENCY_CODE;

            let exchangeRatio = currencyToPay;

            exchangeRates[exchangeCombination] = exchangeRatio;
        } else if (exchangeRateTitle.includes("Selling Rate")) {
            let thbToPayString = rawExchangeRateData['cb:value'][0]['_'];

            let thbToPay = Number(thbToPayString);

            let currencyCodeToBuy = rawExchangeRateData['cb:targetCurrency'][0];

            let preparedCurrencyCodeToBuy = currencyCodeToBuy.toLowerCase();

            let exchangeCombination = BASE_CURRENCY_CODE + ":" + preparedCurrencyCodeToBuy;

            let exchangeRatio = 1 / thbToPay;

            exchangeRates[exchangeCombination] = exchangeRatio;
        }
    }

    return {
        "actualFor": actualFor,
        "exchangeRates": exchangeRates,
        "baseCurrency": BASE_CURRENCY_CODE
    };
}

async function getExchangeRatesData() {
    exchangeRatesData = await actualExchangeRatesDataReceived;

    return exchangeRatesData;
}

module.exports = {
    getCode,

    getExchangeRatesData
};
