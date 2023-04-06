const dayjs = require("dayjs");

const CENTRAL_BANK_CODE = "thai";

function getCode() {
    return CENTRAL_BANK_CODE;
}

async function getExchangeRatesData() {
    return {
        "actualFor": dayjs(),
        "exchangeRates": {
            "rub:thb": 0.01
        },
        "baseCurrency": "thb"
    }
}

module.exports = {
    getCode,

    getExchangeRatesData
}
