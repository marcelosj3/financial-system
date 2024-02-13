import { Input } from "../UI/input.js";
import { Table } from "../UI/table.js";
import { Utils } from "../utils.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class Invoices {
    INVOICES_JSON_PATH = "../../data/invoices.json";
    INVOICES_LOCAL_STORAGE_KEY = "invoicesData";
    TABLE_CONTAINER_SELECTOR = ".table-invoices";
    FILTER_SELECTOR = ".input-filter";
    FILTER_OPTIONS_SELECTOR = "#invoicesFilterOptions";
    FILTER_INPUT_SELECTOR = "input";
    FILTER_SELECT_SELECTOR = "#invoiceStatusOptions";

    utils = {};
    table = {};
    input = {};

    filterBy = null;
    filterValue = null;
    invoices = [];

    /**
     * Initializes the Invoices class with the specified options.
     */
    constructor({ invoices, utils, table, filter } = {}) {
        this.invoices = invoices;
        this.utils = utils || new Utils();
        this.table = table || new Table({ containerSelector: this.TABLE_CONTAINER_SELECTOR, utils: this.utils });
        const inputFilterParameters = {
            containerSelector: this.TABLE_CONTAINER_SELECTOR,
            filterSelector: this.FILTER_SELECTOR,
            filterOptionsSelector: this.FILTER_OPTIONS_SELECTOR,
            inputSelector: this.FILTER_INPUT_SELECTOR,
            selectSelector: this.FILTER_SELECT_SELECTOR,
            data: invoices,
            utils: this.utils
        };
        this.input = filter || new Input(inputFilterParameters);
    }

    /**
     * Fetches invoices information from a JSON file or local storage.
     */
    async fetchInvoices() {
        try {
            const dataParameters = { localStorageKey: this.INVOICES_LOCAL_STORAGE_KEY, path: this.INVOICES_JSON_PATH };
            this.invoices = await this.utils.fetchData(dataParameters);
        } catch (error) {
            console.error("Error fetching invoices data:", error);
        }
    }

    /**
     * Callback function for formatting table cells.
     */
    tableCellCallback({ row, data, header, utils }) {
        const value = data[header];
        if (value === null) return "-";
        if (header.toLowerCase().includes("date")) return utils.formatDate({ date: new Date(value) });
        if (header.toLowerCase() === "value") return utils.formatCurrency(value);
        return value;
    }

    /**
     * Callback function for filtering data based on filter options.
     */
    filterCallback({ filterBy, filterValue }) {
        const filterByDate = (date, value) => {
            if (date === null) return false;
            return date.includes(value);
        };
        const filters = {
            issueMonth: (data, value) => data.filter(({ issueDate }) => filterByDate(issueDate, value)),
            billingMonth: (data, value) => data.filter(({ billingDate }) => filterByDate(billingDate, value)),
            paymentMonth: (data, value) => data.filter(({ paymentDate }) => filterByDate(paymentDate, value)),
            status: (data, value) => data.filter(({ status }) => this.utils.formatStringToKey(status) === value)
        };

        if (!filterBy) return null;
        const data = filters[filterBy](this.invoices, filterValue);
        return data;
    }

    /**
     * Callback function for handling changes in filter options.
     */
    selectCallback(option, input, select) {
        input.disabled = false;
        input.value = "";

        const isStatusOption = option.toLowerCase() === "status";

        input.classList.toggle("d-none", isStatusOption);
        select.classList.toggle("d-none", !isStatusOption);

        if (isStatusOption) return { filterBy: "status", filterValue: select.value };

        if (option.toLowerCase().includes("month")) {
            input.type = "month";
            const isValidDate = this.utils.isValidDate(this.filterValue);
            const isSameFilterOption = this.filterBy != option;
            if (isValidDate && isSameFilterOption) input.value = this.filterValue;
            else input.valueAsDate = new Date();
            return { filterBy: option, filterValue: input.value };
        }

        input.type = "text";
        input.value = "Select a filter option!";
        input.disabled = true;
        return { filterBy: null, filterValue: null };
    }

    /**
     * Event listener for handling changes in filter options.
     */
    filterOptionsEventListener(e, input, select) {
        const selection = e.target.value;
        const response = this.selectCallback(selection, input, select);
        this.filterBy = response.filterBy;
        this.filterValue = response.filterValue;
        const data = this.filterCallback(response);
        this.table.injectData({ dataList: data || this.invoices, cellCallback: this.tableCellCallback });
    }

    /**
     * Event listener for handling changes in filter input.
     */
    filterInputEventListener(e) {
        this.filterValue = e.target.value;
        const data = this.filterCallback({ filterBy: this.filterBy, filterValue: e.target.value });
        this.table.injectData({ dataList: data || this.invoices, cellCallback: this.tableCellCallback });
    }

    /**
     * Initializes and configures the filter for invoices.
     */
    filterInvoices() {
        this.input.FILTER_DATA = this.invoices;

        const statusOptions = ["Issued", "Charge made", "Payment overdue", "Payment made"];
        const { filterOptions, input, select } = this.input.initializeFilterInputs({ selectOptions: statusOptions });

        const that = this;
        const addEventListeners = [
            { element: filterOptions, event: "change", eventListener: function (e) { return that.filterOptionsEventListener(e, input, select); } },
            { element: input, event: "change", eventListener: function (e) { return that.filterInputEventListener(e); } },
            { element: select, event: "change", eventListener: function (e) { return that.filterInputEventListener(e); } },
        ];
        for (const { element, event, eventListener } of addEventListeners) {
            element.addEventListener(event, eventListener);
        }
    }

    /**
     * Fetches and injects all data from the mocked backend.
     */
    async injectData() {
        await this.fetchInvoices();
        this.filterInvoices();
        this.table.injectData({ dataList: this.invoices, cellCallback: this.tableCellCallback });
    }
}
