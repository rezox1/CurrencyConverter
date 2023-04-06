# CurrencyConverter

Сервис конвертации валют

API:
- GET /api/exchangeRates

Возвращает список курсов ЦБ

Параметры:
- centralBankCode (необязательный) - код ЦБ-источника данных ("trai" или "rus"). Если не указано, используется "trai"

Пример запроса: http://localhost:3000/api/exchangeRates?centralBankCode=rus

- GET /api/convert

Конвертирует одну валюту в другую

Параметры:
- from (обязательный) - код валюты, из которой необходимо произвести конвертацию (например, "rub")
- to (обязательный) - код валюты, в которую необходимо произвести конвертацию (например, "thb")
- amount (обязательный) - сумма, для которой необходимо произвести конвертацию
- centralBankCode (необязательный) - код ЦБ-источника данных ("trai" или "rus"). Если не указано, используется "trai" (если у банка Таиланда есть обменный курс для указанных валют)

Примеры запроса:
- http://localhost:3000/api/convert?amount=1&from=usd&to=rub
- http://localhost:3000/api/convert?amount=1&from=usd&to=thb&centralBankCode=thai
