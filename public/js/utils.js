export class Utils {
    LOCATIONS = {
        'pt-br': { currency: 'BRL', locale: 'pt-BR' },
        'en-us': { currency: 'USD', locale: 'en-US' }
    };

    currency = '';
    locale = '';

    constructor(location = 'pt-br') {
        const permittedLocations = Object.keys(this.LOCATIONS)
        if (!permittedLocations.includes(location))
            throw new Error(`Location value should be one of the following: '${permittedLocations.join(", ")}'.`)

        const { currency, locale } = this.LOCATIONS[location];
        this.currency = currency;
        this.locale = locale;
    }

    /**
     * Formats the given price into currency based on the provided locale.
     */
    formatCurrency(price) {
        const currencyFormatter = new Intl.NumberFormat(this.locale, {
            style: 'currency',
            currency: this.currency,
        });

        return currencyFormatter.format(price);
    }

    /**
     * Formats the given date string into a localized date string.
     * @param {string} dateString - The date string to be formatted.
     * @returns {string} - The formatted date string.
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString(this.locale);
    }

    /**
     * Fetches data from local storage or a JSON file.
     */
    async fetchData({ localStorageKey, path } = {}) {
        try {
            // Try fetching from local storage, fallback to JSON file if not available
            return this.fetchDataFromLocalStorage(localStorageKey) || await this.fetchDataFromJSON(path, localStorageKey);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    }

    /**
     * Fetches data from local storage.
     */
    fetchDataFromLocalStorage(localStorageKey) {
        const storedData = localStorage.getItem(localStorageKey);
        return storedData ? JSON.parse(storedData) : null;
    }

    /**
     * Fetches data from the JSON file.
     */
    async fetchDataFromJSON(path, localStorageKey) {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error('Failed to fetch data.');
        }

        const json = await response.json();

        // Store fetched data in local storage for future use
        localStorage.setItem(localStorageKey, JSON.stringify(json));

        return json;
    }
}
