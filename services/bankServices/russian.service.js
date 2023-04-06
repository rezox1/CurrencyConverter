const dayjs = require('dayjs');

const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const schedule = require('node-schedule');

const axios = require('axios');

const xml2js = require('xml2js');
const xmlParser = new xml2js.Parser;

const CENTRAL_BANK_CODE = "rus";

const BASE_CURRENCY_CODE = "rub";

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
    const GET_EXCHANGE_DATA_URL = "http://www.cbr.ru/scripts/XML_daily.asp";

    let {"data": xmlWithExchangeRates} = await axios.get(GET_EXCHANGE_DATA_URL);

    let parsedXmlData = await xmlParser.parseStringPromise(xmlWithExchangeRates);

    let actualForString = parsedXmlData.ValCurs.$.Date;

    let actualFor = dayjs(actualForString, "DD.MM.YYYY");

    let rawExchangeRates = parsedXmlData.ValCurs.Valute;

    let exchangeRates = {};

    for (let rawExchangeRateData of rawExchangeRates) {
        let currencyCode = rawExchangeRateData.CharCode[0];
        currencyCode = currencyCode.toLowerCase();

        let rublesToPayString = rawExchangeRateData.Value[0],
            currencyToGetString = rawExchangeRateData.Nominal[0];

        let calculationAccuracy = currencyToGetString.length - 1;

        let [, fractionalPartOfRublesToPayString] = rublesToPayString.split(",");
        if (fractionalPartOfRublesToPayString) {
            calculationAccuracy += fractionalPartOfRublesToPayString.length;
        }

        let preparedRublesToPayString = rublesToPayString.replace(",", "."),
            preparedCurrencyToGetString = currencyToGetString.replace(",", ".");

        let rublesToPay = Number(preparedRublesToPayString),
            currencyToGet = Number(preparedCurrencyToGetString);

        let exchangeCombination = currencyCode + ":" + BASE_CURRENCY_CODE;

        let exchangeRatio = currencyToGet / rublesToPay;

        exchangeRates[exchangeCombination] = exchangeRatio;

        let anotherExchangeCombination = BASE_CURRENCY_CODE + ":" + currencyCode;

        let anotherExchangeRatio = parseFloat((rublesToPay / currencyToGet).toFixed(calculationAccuracy));

        exchangeRates[anotherExchangeCombination] = anotherExchangeRatio;
    }

    return {
        "actualFor": actualFor,
        "exchangeRates": exchangeRates,
        "baseCurrency": BASE_CURRENCY_CODE
    }
}

async function getExchangeRatesData() {
    exchangeRatesData = await actualExchangeRatesDataReceived;

    return exchangeRatesData;
}

module.exports = {
    getCode,

    getExchangeRatesData
};
