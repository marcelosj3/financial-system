import { Input } from "../../UI/input.js";
import { Table } from "../../UI/table.js";
import { Utils } from "../../utils.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class InvoicesTable {
    INVOICES_JSON_PATH = "../../data/invoices.json";
    INVOICES_LOCAL_STORAGE_KEY = "invoicesData";
    TABLE_CONTAINER_SELECTOR = ".table-invoices";
    FILTER_SELECTOR = ".input-filter";
    FILTER_OPTIONS_SELECTOR = "#invoicesTableFilterOptions";
    FILTER_INPUT_SELECTOR = "input";
    FILTER_SELECT_SELECTOR = "#invoicesTableStatusOptions";
    QUERY_PARAMS_FILTER_BY_KEY = "filter_table_by";
    QUERY_PARAMS_FILTER_VALUE_KEY = "filter_table_value";

    utils = {};
    table = {};
    input = {};

    filterBy = null;
    filterValue = null;
    invoices = [];

    /**
     * Initializes the Invoices class with the specified options.
     */
    constructor({ invoices, utils, table, filter, metrics } = {}) {
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
    selectCallback({ option, value, input, select }) {
        const defaultValue = value ?? undefined

        input.disabled = false;
        input.value = "";

        const isStatusOption = option.toLowerCase() === "status";

        input.classList.toggle("d-none", isStatusOption);
        select.classList.toggle("d-none", !isStatusOption);

        if (isStatusOption) return this.setQueryParamsAndReturnFilterValues({ filterBy: "status", filterValue: defaultValue ?? select.value })

        if (option.toLowerCase().includes("month")) {
            input.type = "month";
            const isValidDate = this.utils.isValidDate(defaultValue ?? this.filterValue);
            const isSameFilterOption = this.filterBy !== option;
            if (isValidDate && isSameFilterOption) input.value = defaultValue ?? this.filterValue;
            else input.valueAsDate = !!defaultValue ? new Date(defaultValue) : new Date();
            return this.setQueryParamsAndReturnFilterValues({ filterBy: option, filterValue: defaultValue ?? input.value })
        }

        input.type = "text";
        input.value = "Select a filter option!";
        input.disabled = true;
        this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY);
        this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY);
        return { filterBy: null, filterValue: null };
    }

    /**
     * Sets query parameters for filter options and returns the filter information.
     */
    setQueryParamsAndReturnFilterValues({ filterBy, filterValue }) {
        this.utils.setQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY, filterBy);
        this.utils.setQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY, filterValue);
        return { filterBy, filterValue };
    }

    /**
     * Event listener for handling changes in filter options.
     */
    filterOptionsEventListener(e, input, select) {
        const selection = e.target.value;
        const response = this.selectCallback({ option: selection, input, select });
        this.filterBy = response.filterBy;
        this.filterValue = response.filterValue;
        this.filterAndInjectIntoTable(response);
    }

    /**
     * Event listener for handling changes in filter input.
     */
    filterInputEventListener(e) {
        this.filterValue = e.target.value;
        const response = this.setQueryParamsAndReturnFilterValues({ filterBy: this.filterBy, filterValue: e.target.value });
        this.filterAndInjectIntoTable(response);
    }

    /**
     * Filter data and inject it into the table.
     */
    filterAndInjectIntoTable({ filterBy, filterValue }) {
        const data = this.filterCallback({ filterBy, filterValue });
        this.table.injectData({ dataList: data || this.invoices, cellCallback: this.tableCellCallback });
    }

    /**
     * Initializes and configures the filter for invoices.
     */
    filterInvoices({ filterOptions, input, select }) {
        const that = this;
        const addEventListeners = [];

        if (!!filterOptions) addEventListeners.push({ element: filterOptions, event: "change", eventListener: function (e) { return that.filterOptionsEventListener(e, input, select); } })
        if (!!input) addEventListeners.push({ element: input, event: "change", eventListener: function (e) { return that.filterInputEventListener(e); } })
        if (!!select) addEventListeners.push({ element: select, event: "change", eventListener: function (e) { return that.filterInputEventListener(e); } })

        for (const { element, event, eventListener } of addEventListeners) {
            element.addEventListener(event, eventListener);
        }
    }

    /**
     * Handle query parameters for initial setup.
     */
    handleQueryParams({ filterOptions, input, select }) {
        const queryParams = this.utils.fetchQueryParams();
        const filterBy = queryParams.get("filter_by");
        const filterValue = queryParams.get("filter_value");

        if (!filterBy || !filterValue) return false;

        this.filterBy = filterBy;
        this.filterValue = filterValue;

        filterOptions.value = filterBy;

        const response = this.selectCallback({ option: filterBy, value: filterValue, input, select });
        if (filterBy === "status") select.value = filterValue;
        this.filterAndInjectIntoTable(response);

        return true;
    }

    /**
      * Injects the list of invoices into the table UI.
      */
    injectInvoiceList() {
        this.input.FILTER_DATA = this.invoices;
        const statusOptions = ["Issued", "Charge made", "Payment overdue", "Payment made"];
        const { filterOptions, input, select } = this.input.initializeFilterInputs({ selectOptions: statusOptions });

        this.filterInvoices({ statusOptions, filterOptions, input, select });
        const hasQueryParams = this.handleQueryParams({ filterOptions, input, select });
        if (!hasQueryParams) this.table.injectData({ dataList: this.invoices, cellCallback: this.tableCellCallback });
    }

}
