const dayjs = require("dayjs");

const CENTRAL_BANK_CODE = "rus";

function getCode() {
    return CENTRAL_BANK_CODE;
}

async function getExchangeRatesData() {
    return {
        "actualFor": dayjs(),
        "exchangeRates": {
            "rub:thb": 1
        },
        "baseCurrency": "rub"
    }
}

module.exports = {
    getCode,

    getExchangeRatesData
}
