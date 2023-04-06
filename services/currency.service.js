const dayjs = require("dayjs");

const DEFAULT_CENTRAL_BANK_CODE = "thai";

function getDefaultCentralBankCode() {
	return DEFAULT_CENTRAL_BANK_CODE;
}

async function isCentralBankCodeSupported(centralBankCode) {
	if (!centralBankCode) {
		throw new Error("centralBankCode is not defined");
	}

	// ...

	return true;
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
