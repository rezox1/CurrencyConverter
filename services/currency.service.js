const dayjs = require("dayjs");

const {
    thaiBankService,
    russianBankService
} = require("./bankServices");

const THAI_CENTRAL_BANK_CODE = "thai";

const RUSSIAN_CENTRAL_BANK_CODE = "russian";

const DEFAULT_CENTRAL_BANK_CODE = THAI_CENTRAL_BANK_CODE;

const SUPPORTED_CENTRAL_BANK_CODES = [
    THAI_CENTRAL_BANK_CODE,
    RUSSIAN_CENTRAL_BANK_CODE
];

function getDefaultCentralBankCode() {
    return DEFAULT_CENTRAL_BANK_CODE;
}

function isCentralBankCodeSupported(centralBankCode) {
    if (!centralBankCode) {
        throw new Error("centralBankCode is not defined");
    }

    if (SUPPORTED_CENTRAL_BANK_CODES.includes(centralBankCode)) {
        return true;
    } else {
        return false;
    }
}

async function getActualExchangeRates({centralBankCode}) {
    if (!centralBankCode) {
        throw new Error("centralBankCode is not defined");
    }

    // ...

    let currentDate = dayjs();

    return {
        "actualExchangeRates": {},
        "actualFor": currentDate
    };
}

async function isCurrencySupported(currencyCode) {
    if (!currencyCode) {
        throw new Error("currencyCode is not defined");
    }

    // ...

    return true;
}

async function convertCurrencies({fromCurrency, toCurrency, amount, centralBankCode}) {
    if (!fromCurrency) {
        // ...
    }

    let currentDate = dayjs();

    return {
        "value": amount,
        "actualFor": currentDate
    };
}

module.exports = {
    getDefaultCentralBankCode,
    isCentralBankCodeSupported,

    getActualExchangeRates,

    isCurrencySupported,

    convertCurrencies
};
