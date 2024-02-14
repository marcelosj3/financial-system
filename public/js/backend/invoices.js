import { Input } from "../UI/input.js";
import { Metrics } from "../UI/metrics.js";
import { Table } from "../UI/table.js";
import { Utils } from "../utils.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class Invoices {
    INVOICES_JSON_PATH = "../../data/invoices.json";
    INVOICES_LOCAL_STORAGE_KEY = "invoicesData";
    METRICS_CONTAINER_SELECTOR = "section.metrics";
    METRICS_CARDS_CONTAINER_SELECTOR = ".cards";
    TABLE_CONTAINER_SELECTOR = ".table-invoices";
    FILTER_SELECTOR = ".input-filter";
    FILTER_OPTIONS_SELECTOR = "#invoicesFilterOptions";
    FILTER_INPUT_SELECTOR = "input";
    FILTER_SELECT_SELECTOR = "#invoiceStatusOptions";
    QUERY_PARAMS_FILTER_BY_KEY = "filter_by";
    QUERY_PARAMS_FILTER_VALUE_KEY = "filter_value";

    utils = {};
    table = {};
    inputTable = {};

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
        const inputTableFilterParameters = {
            containerSelector: this.TABLE_CONTAINER_SELECTOR,
            filterSelector: this.FILTER_SELECTOR,
            filterOptionsSelector: this.FILTER_OPTIONS_SELECTOR,
            inputSelector: this.FILTER_INPUT_SELECTOR,
            selectSelector: this.FILTER_SELECT_SELECTOR,
            data: invoices,
            utils: this.utils
        };
        this.inputTable = filter || new Input(inputTableFilterParameters);
        this.metrics = metrics || new Metrics({ containerSelector: this.METRICS_CONTAINER_SELECTOR, cardsContainerSelector: this.METRICS_CARDS_CONTAINER_SELECTOR })
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

    metricsCardsInfo({ invoices }) {

        const injectValues = ({ object, value }) => {
            object.value += value
            object.quantity += 1
        }


        const totalIssuedInvoices = {
            title: "Total Issued Invoices",
            description: "Gain insight into the company's financial performance by tracking the total value of invoices issued.",
            value: 0, quantity: 0
        }
        const issuedInvoicesWithoutCharges = {
            title: "Issued Invoices without Charges",
            description: "Evaluate billing efficiency by examining the total value of invoices issued without associated charges.",
            value: 0, quantity: 0
        }
        const overdueInvoices = {
            title: "Overdue Invoices - Delinquency",
            description: "Identify and address financial risks by monitoring the total value of overdue invoices, reflecting delinquency status.",
            value: 0, quantity: 0
        }
        const invoicesToBePaid = {
            title: "Invoices to be Paid",
            description: "Effectively plan and manage upcoming payments with insights into the total value of invoices awaiting settlement.",
            value: 0, quantity: 0

        }
        const paidInvoices = {
            title: "Paid Invoices",
            description: "Celebrate financial achievements by tracking the total value of invoices that have been successfully paid.",
            value: 0, quantity: 0
        }



        for (const { value, status, billingDate } of invoices) {
            injectValues({ object: totalIssuedInvoices, value })

            if (!billingDate) injectValues({ object: issuedInvoicesWithoutCharges, value })
            if (status === "Charge made") injectValues({ object: invoicesToBePaid, value })
            if (status === "Payment overdue") injectValues({ object: overdueInvoices, value })
            if (status === "Payment made") injectValues({ object: paidInvoices, value })

        }

        const metricsCards = [totalIssuedInvoices, issuedInvoicesWithoutCharges, overdueInvoices, invoicesToBePaid, paidInvoices];

        return metricsCards;
    }


    injectInvoiceList() {
        this.inputTable.FILTER_DATA = this.invoices;
        const statusOptions = ["Issued", "Charge made", "Payment overdue", "Payment made"];
        const { filterOptions, input, select } = this.inputTable.initializeFilterInputs({ selectOptions: statusOptions });

        this.filterInvoices({ statusOptions, filterOptions, input, select });
        const hasQueryParams = this.handleQueryParams({ filterOptions, input, select });
        if (!hasQueryParams) this.table.injectData({ dataList: this.invoices, cellCallback: this.tableCellCallback });
    }

    injectMetrics() {
        const data = this.metricsCardsInfo({ invoices: this.invoices })
        this.metrics.injectData({ data })

    }

    /**
     * Fetches and injects all data from the mocked backend.
     */
    async injectData() {
        await this.fetchInvoices();
        this.injectInvoiceList()
        this.injectMetrics()
    }
}
