const dayjs = require("dayjs");

const {
    thaiBankService,
    russianBankService
} = require("./bankServices");

const THAI_CENTRAL_BANK_CODE = thaiBankService.getCode(),
    RUSSIAN_CENTRAL_BANK_CODE = russianBankService.getCode();

const DEFAULT_CENTRAL_BANK_CODE = THAI_CENTRAL_BANK_CODE;

const SUPPORTED_CENTRAL_BANK_CODES = [
    THAI_CENTRAL_BANK_CODE,
    RUSSIAN_CENTRAL_BANK_CODE
];

const bankServices = {}

bankServices[THAI_CENTRAL_BANK_CODE] = thaiBankService;
bankServices[RUSSIAN_CENTRAL_BANK_CODE] = russianBankService;

function getDefaultCentralBankCode() {
    return DEFAULT_CENTRAL_BANK_CODE;
}

function isCentralBankCodeSupported(centralBankCode) {
    if (!centralBankCode) {
        throw new Error("centralBankCode is not defined");
    }

    centralBankCode = centralBankCode.toLowerCase();

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

    centralBankCode = centralBankCode.toLowerCase();

    let centralBankCodeIsSupported = isCentralBankCodeSupported(centralBankCode);
    if (centralBankCodeIsSupported) {
        // ok, move on
    } else {
        throw new Error(`centralBankCode "${centralBankCode}" is not supported`);
    }

    let actualExchangeRates = {}

    let bankService = bankServices[centralBankCode];

    let bankExchangeRatesData = await bankService.getExchangeRatesData();

    let actualFor = bankExchangeRatesData.actualFor,
        allExchangeRates = bankExchangeRatesData.exchangeRates,
        baseCurrency = bankExchangeRatesData.baseCurrency;

    for (let currenciesNames in allExchangeRates) {
        if (currenciesNames.startsWith(baseCurrency)) {
            let targetCurrency = currenciesNames.replace(baseCurrency + ":", "");
            targetCurrency = targetCurrency.toUpperCase();

            actualExchangeRates[targetCurrency] = allExchangeRates[currenciesNames];
        }
    }

    return {
        "actualExchangeRates": actualExchangeRates,
        "baseCurrency": baseCurrency.toUpperCase(),
        "actualFor": actualFor
    };
}

async function convertCurrencies({fromCurrency, toCurrency, amount, centralBankCode}) {
    if (!fromCurrency) {
        throw new Error("fromCurrency is not defined");
    } else if (!toCurrency) {
        throw new Error("toCurrency is not defined");
    } else if (typeof amount !== "number") {
        throw new Error("type of amount is not number, it is " + typeof amount);
    } else if (Number.isNaN(amount)) {
        throw new Error("amount is NaN");
    }

    if (centralBankCode) {
        centralBankCode = centralBankCode.toLowerCase();

        let centralBankCodeIsSupported = isCentralBankCodeSupported(centralBankCode);
        if (centralBankCodeIsSupported) {
            // ok, move on
        } else {
            throw new Error(`centralBankCode "${centralBankCode}" is not supported`);
        }
    }

    fromCurrency = fromCurrency.toLowerCase();

    toCurrency = toCurrency.toLowerCase();

    let conversionResult,
        actualFor;

    if (fromCurrency === toCurrency) {
        conversionResult = amount;

        actualFor = dayjs();
    } else {
        let bankServicesToProcess = [];

        if (centralBankCode) {
            let bankServiceToProcess = bankServices[centralBankCode];

            bankServicesToProcess.push(bankServiceToProcess);
        } else {
            for (let centralBankCode in bankServices) {
                let bankServiceToProcess = bankServices[centralBankCode];

                bankServicesToProcess.push(bankServiceToProcess);
            }
        }

        let exchangeCombination = fromCurrency + ":" + toCurrency;

        let availableExchanges = [];

        for (let bankService of bankServicesToProcess) {
            let bankExchangeRatesData = await bankService.getExchangeRatesData();

            let actualFor = bankExchangeRatesData.actualFor,
                allExchangeRates = bankExchangeRatesData.exchangeRates;

            if (exchangeCombination in allExchangeRates) {
                availableExchanges.push({
                    "exchangeRatio": allExchangeRates[exchangeCombination],
                    "bankService": bankService,
                    "actualFor": actualFor
                });
            }
        }

        if (availableExchanges.length > 0) {
            let exchengeToProcess;

            if (availableExchanges.length === 1) {
                exchengeToProcess = availableExchanges[0];
            } else {
                let exchangeForDefaultBank = availableExchanges.find((availableExchange) => {
                    let defaultBankService = bankServices[DEFAULT_CENTRAL_BANK_CODE];

                    if (availableExchange.bankService === defaultBankService) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (exchangeForDefaultBank) {
                    exchengeToProcess = exchangeForDefaultBank;
                } else {
                    exchengeToProcess = availableExchanges[0];
                }
            }

            let exchangeRatio = exchengeToProcess.exchangeRatio;

            conversionResult = amount * exchangeRatio;

            actualFor = exchengeToProcess.actualFor;

            if (!centralBankCode) {
                centralBankCode = exchengeToProcess.bankService.getCode();
            }
        } else {
            throw new Error(`can't make convertation from "${fromCurrency}" to "${toCurrency}"`);
        }
    }

    return {
        "result": conversionResult,
        "actualFor": actualFor,
        "centralBankCode": centralBankCode
    };
}

module.exports = {
    getDefaultCentralBankCode,
    isCentralBankCodeSupported,

    getActualExchangeRates,

    convertCurrencies
};
