export class Utils {
    // Define supported locations with corresponding currency and locale
    LOCATIONS = {
        'pt-br': { currency: 'BRL', locale: 'pt-BR' },
        'en-us': { currency: 'USD', locale: 'en-US' }
    };

    currency = '';
    locale = '';

    /**
     * Initializes the Utils class with the specified location.
     */
    constructor(location = 'pt-br') {
        const permittedLocations = Object.keys(this.LOCATIONS);
        if (!permittedLocations.includes(location)) {
            throw new Error(`Invalid location value '${location}'. Permitted locations are: '${permittedLocations.join(", ")}'.`);
        }

        // Set currency and locale based on the provided location
        const { currency, locale } = this.LOCATIONS[location];
        this.currency = currency;
        this.locale = locale;
    }

    /**
     * Converts a string to a key format by making the first letter lowercase
     * and removing spaces and apostrophes.
     */
    formatStringToKey(inputString) {
        const words = inputString.split(" ");
        return words.map((word, index) => {
            let string = word.toLowerCase().replace(/['\s]/g, '');
            if (index === 0) return string;

            return string.charAt(0).toUpperCase() + string.slice(1);
        }).join("");
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
     */
    formatDate({ date, options } = {}) {
        const dateValue = date ?? new Date();
        const optionsValue = options ?? {};

        return dateValue.toLocaleDateString(this.locale, optionsValue);
    }

    /**
     * Checks if the provided value is a valid date.
     */
    isValidDate(date) {
        if (date == null) return false;

        try {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) return false;
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Fetches data from local storage or a JSON file.
     */
    async fetchData({ localStorageKey, path } = {}) {
        try {
            // Try fetching from local storage, fallback to JSON file if not available
            return this.fetchDataFromLocalStorage(localStorageKey) || await this.fetchDataFromJSON(path, localStorageKey);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    /**
     * Fetches data from local storage.
     * @param {string} localStorageKey - The key for local storage.
     * @returns {Object|null} - The fetched data or null if not available.
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

        if (!response.ok) throw new Error('Failed to fetch data.');

        const json = await response.json();

        // Store fetched data in local storage for future use
        localStorage.setItem(localStorageKey, JSON.stringify(json));

        return json;
    }

    /**
     * Fetches query parameters from the current URL.
     */
    fetchQueryParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * Sets a query parameter in the current URL.
     */
    setQueryParams(key, value) {
        const searchParams = this.fetchQueryParams();
        searchParams.set(key, value);
        this.pushQueryParamsState(searchParams);
    }

    /**
     * Deletes a query parameter from the current URL.
     */
    deleteQueryParams(key) {
        const searchParams = this.fetchQueryParams();
        searchParams.delete(key);
        this.pushQueryParamsState(searchParams);
    }

    /**
     * Pushes the updated query parameters to the browser history.
     */
    pushQueryParamsState(searchParams) {
        const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
        history.pushState(null, '', newRelativePathQuery);
    }
}
