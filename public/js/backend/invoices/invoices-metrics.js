import { Input } from "../../UI/input.js";
import { Metrics } from "../../UI/metrics.js";
import { Utils } from "../../utils.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class InvoicesMetrics {
    METRICS_CONTAINER_SELECTOR = "section.metrics";
    METRICS_CARDS_CONTAINER_SELECTOR = ".cards";
    FILTER_SELECTOR = ".input-filter";
    FILTER_OPTIONS_SELECTOR = "#invoicesMetricsFilterOptions";
    FILTER_INPUT_SELECTOR = "input";
    FILTER_SELECT_SELECTOR = "#metricsYearOptions";
    FILTER_PARAGRAPH_SELECTOR = ".datepicker-trimester";
    QUERY_PARAMS_FILTER_BY_KEY = "filter_metrics_by";
    QUERY_PARAMS_FILTER_VALUE_KEY = "filter_metrics_value";

    utils = {};
    metrics = {};
    input = {};

    filterBy = null;
    filterValue = null;
    invoices = [];

    /**
     * Initializes the InvoicesMetrics class with the specified options.
     */
    constructor({ invoices, utils, metrics, input } = {}) {
        this.invoices = invoices;
        this.utils = utils || new Utils();
        this.metrics = metrics || new Metrics({ containerSelector: this.METRICS_CONTAINER_SELECTOR, cardsContainerSelector: this.METRICS_CARDS_CONTAINER_SELECTOR });
        const inputFilterParameters = {
            containerSelector: this.METRICS_CONTAINER_SELECTOR,
            filterSelector: this.FILTER_SELECTOR,
            filterOptionsSelector: this.FILTER_OPTIONS_SELECTOR,
            inputSelector: this.FILTER_INPUT_SELECTOR,
            selectSelector: this.FILTER_SELECT_SELECTOR,
            data: invoices,
            utils: this.utils
        };
        this.input = input || new Input(inputFilterParameters);
    }

    /**
     * Generates metrics data based on the provided invoices.
     */
    metricsCardsInfo({ invoices }) {
        const injectValues = ({ object, value }) => {
            object.value += value;
            object.quantity += 1;
        };

        const totalIssuedInvoices = {
            title: "Total Issued Invoices",
            description: "Gain insight into the company's financial performance by tracking the total value of invoices issued.",
            value: 0, quantity: 0
        };
        const issuedInvoicesWithoutCharges = {
            title: "Issued Invoices without Charges",
            description: "Evaluate billing efficiency by examining the total value of invoices issued without associated charges.",
            value: 0, quantity: 0
        };
        const overdueInvoices = {
            title: "Overdue Invoices - Delinquency",
            description: "Identify and address financial risks by monitoring the total value of overdue invoices, reflecting delinquency status.",
            value: 0, quantity: 0
        };
        const invoicesToBePaid = {
            title: "Invoices to be Paid",
            description: "Effectively plan and manage upcoming payments with insights into the total value of invoices awaiting settlement.",
            value: 0, quantity: 0
        };
        const paidInvoices = {
            title: "Paid Invoices",
            description: "Celebrate financial achievements by tracking the total value of invoices that have been successfully paid.",
            value: 0, quantity: 0
        };

        for (const { value, status, billingDate } of invoices) {
            injectValues({ object: totalIssuedInvoices, value });
            if (!billingDate) injectValues({ object: issuedInvoicesWithoutCharges, value });
            if (status === "Charge made") injectValues({ object: invoicesToBePaid, value });
            if (status === "Payment overdue") injectValues({ object: overdueInvoices, value });
            if (status === "Payment made") injectValues({ object: paidInvoices, value });
        }

        const metricsCards = [totalIssuedInvoices, issuedInvoicesWithoutCharges, overdueInvoices, invoicesToBePaid, paidInvoices];
        return metricsCards;
    }

    /**
     * Callback function for handling filter selection changes.
     */
    selectCallback({ option, input, select, paragraph, value }) {
        const defaultValue = value ?? this.filterValue;

        const utils = this.utils;
        const formatMonth = (dateValue) => utils.formatDate({ date: dateValue, options: { year: "numeric", month: "numeric" } }).split("/").reverse().join("-");

        input.classList.add("d-none");
        select.classList.add("d-none");
        paragraph.classList.add("d-none");

        input.disabled = false;
        input.value = "";

        const filters = {
            "year": (filterBy, filterValue) => {
                select.classList.remove("d-none");
                const year = utils.formatDate({ date: filterValue, options: { year: "numeric" } });
                select.value = year;

                return { filterBy, filterValue };
            },
            "trimester": (filterBy, filterValue) => {
                const value = filterValue ?? new Date();
                const date = new Date(new Date(value).setDate(15));
                input.classList.remove("d-none");
                paragraph.classList.remove("d-none");
                input.type = "month";
                const month = formatMonth(date);
                input.value = month;
                const nextThreeMonthsDate = new Date(date.setMonth(date.getMonth() + 3));
                const nextThreeMonthsValue = formatMonth(nextThreeMonthsDate);
                paragraph.textContent = `${month} to ${nextThreeMonthsValue}`;
                input.style.width = `${paragraph.clientWidth + 40}px`;

                return { filterBy, filterValue: date };
            },
            "month": (filterBy, filterValue) => {
                input.classList.remove("d-none");
                input.type = "month";
                const month = formatMonth(filterValue);
                input.value = month;

                return { filterBy, filterValue };
            }
        };

        this.filterValue = this.filterValue || new Date();

        if (Object.keys(filters).includes(option)) {
            const response = filters[option](option, this.filterValue);
            this.filterBy = response.filterBy;
            this.filterValue = response.filterValue;
            return response;
        }

        input.classList.remove("d-none");
        input.type = "text";
        input.value = "Select a filter option!";
        input.disabled = true;
        this.filterBy = null;
        this.filterValue = null;
    }

    /**
     * Event listener for filter options change event.
     */
    filterOptionsEventListener({ e, input, select, paragraph }) {
        const selection = e.target.value;
        const response = this.selectCallback({ option: selection, input, select, paragraph });
        this.filterBy = response.filterBy;
        this.filterValue = response.filterValue;
    }

    /**
     * Event listener for filter input change event.
     */
    filterInputEventListener({ e, input, select, paragraph, utils }) {
        const inputValue = new Date(new Date(e.target.value).setDate(new Date(e.target.value).getDate() + 1));
        const filterBy = this.filterBy;

        if (filterBy === "trimester") {
            const formatMonth = (dateValue) => utils.formatDate({ date: dateValue, options: { year: "numeric", month: "numeric" } }).split("/").reverse().join("-");
            input.classList.remove("d-none");
            paragraph.classList.remove("d-none");
            input.type = "month";
            const month = formatMonth(inputValue);
            input.value = month;
            const nextThreeMonthsDate = new Date(new Date(inputValue).setMonth(inputValue.getMonth() + 3));
            const nextThreeMonthsValue = formatMonth(nextThreeMonthsDate);
            paragraph.textContent = `${month} to ${nextThreeMonthsValue}`;
            input.style.width = `${paragraph.clientWidth + 40}px`;
        }

        this.filterValue = inputValue;
    }

    /**
     * Attaches event listeners to filter elements.
     */
    filterMetrics({ filterOptions, input, select, paragraph }) {
        const that = this;
        const addEventListeners = [];

        if (!!filterOptions) addEventListeners.push({ element: filterOptions, event: "change", eventListener: function (e) { return that.filterOptionsEventListener({ e, input, select, paragraph }); } });
        if (!!input) addEventListeners.push({ element: input, event: "change", eventListener: function (e) { return that.filterInputEventListener({ e, input, select, paragraph, utils: that.utils }); } });
        if (!!select) addEventListeners.push({ element: select, event: "change", eventListener: function (e) { return that.filterInputEventListener({ e, input, select, paragraph, utils: that.utils }); } });

        for (const { element, event, eventListener } of addEventListeners) {
            element.addEventListener(event, eventListener);
        }
    }

    /**
     * Adds year values to the select element.
     */
    implementYearValuesToSelect({ select }) {
        const quantityOfYears = 200;
        const startingYear = new Date().getFullYear() - quantityOfYears / 2;
        Array.from(Array(quantityOfYears).keys()).reverse()
            .forEach((value) => {
                const option = document.createElement("option");
                option.value = value + startingYear + 1;
                option.textContent = value + startingYear + 1;
                select.appendChild(option);
            });
    }

    /**
     * Injects data into the Metrics class.
     */
    injectData({ data }) {
        const metricsData = this.metricsCardsInfo({ invoices: data });
        this.metrics.injectData({ data: metricsData });
    }

    /**
     * Injects metrics data into the UI using the Metrics class.
     */
    injectMetrics() {
        this.input.FILTER_DATA = this.invoices;
        const { filterOptions, input, select } = this.input.initializeFilterInputs();
        this.implementYearValuesToSelect({ select });
        const trimesterParagraph = document.querySelector(`${this.METRICS_CONTAINER_SELECTOR} ${this.FILTER_PARAGRAPH_SELECTOR}`);
        this.filterMetrics({ filterOptions, input, select, paragraph: trimesterParagraph });

        this.injectData({ data: this.invoices });
    }
}
