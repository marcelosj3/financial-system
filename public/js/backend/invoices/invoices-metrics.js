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
    METRICS_CHART_CONTAINER_SELECTOR = ".metrics-chart-container"
    METRICS_CHART_SELECTOR = "#metrics-chart"
    METRICS_CHART_STATE_MANAGER_SELECTOR = ".metrics-chart-state-manager"
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
        this.metrics = metrics || new Metrics({
            containerSelector: this.METRICS_CONTAINER_SELECTOR,
            cardsContainerSelector: this.METRICS_CARDS_CONTAINER_SELECTOR,
            chartContainerSelector: this.METRICS_CHART_CONTAINER_SELECTOR,
            chartSelector: this.METRICS_CHART_SELECTOR,
            chartStateManagerSelector: this.METRICS_CHART_STATE_MANAGER_SELECTOR,
        });
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
                const date = new Date(new Date(value).setDate(new Date(value).getDate() + 1));
                input.classList.remove("d-none");
                paragraph.classList.remove("d-none");
                input.type = "month";
                const month = formatMonth(date);
                input.value = month;
                const nextThreeMonthsDate = new Date(new Date(date).setMonth(date.getMonth() + 3));
                const nextThreeMonthsValue = utils.formatDate({ date: nextThreeMonthsDate, locale: 'en-US', options: { month: 'short', year: 'numeric' } });
                paragraph.textContent = `${utils.formatDate({ date, locale: 'en-US', options: { month: 'short', year: 'numeric' } })} to ${nextThreeMonthsValue}`;
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
            utils.setQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY, response.filterBy)
            utils.setQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY, formatMonth(response.filterValue))
            return response;
        }

        input.classList.remove("d-none");
        input.type = "text";
        input.value = "Select a filter option!";
        input.disabled = true;
        this.filterBy = null;
        this.filterValue = null;
        this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY);
        this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY);
        return { filterBy: null, filterValue: null };
    }

    /**
     * Event listener for filter options change event.
     */
    filterOptionsEventListener({ e, input, select, paragraph }) {
        const selection = e.target.value;
        const response = this.selectCallback({ option: selection, input, select, paragraph });
        this.filterBy = response.filterBy;
        this.filterValue = response.filterValue;
        this.filterAndInjectData(response)
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
            const nextThreeMonthsValue = utils.formatDate({ date: nextThreeMonthsDate, locale: 'en-US', options: { month: 'short', year: 'numeric' } });
            paragraph.textContent = `${utils.formatDate({ date: inputValue, locale: 'en-US', options: { month: 'short', year: 'numeric' } })} to ${nextThreeMonthsValue}`;
            input.style.width = `${paragraph.clientWidth + 40}px`;
        }

        this.filterValue = inputValue;
        this.filterAndInjectData({ filterBy: this.filterBy, filterValue: this.filterValue })
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
    * Callback function for filtering data based on filter options.
    */
    filterCallback({ filterBy, filterValue }) {
        // Define filters for different time periods
        const filters = {
            year: (data, value) => data.filter(({ issueDate, billingDate, paymentDate }) => {
                const year = value.getFullYear();
                const dates = [issueDate, billingDate, paymentDate].map((date) => {
                    if (!date) return false;
                    return new Date(date).getFullYear() === year;
                });
                // Return true if at least one date matches the filter
                return dates.some((val) => val);
            }),
            trimester: (data, value) => data.filter(({ issueDate, billingDate, paymentDate }) => {
                // Calculate the first day of the trimester
                const firstDayOfFirstMonth = new Date(value);
                firstDayOfFirstMonth.setDate(1);
                firstDayOfFirstMonth.setHours(6, 0, 0, 0);

                // Calculate the last day of the trimester
                const lastDayOfLastMonth = new Date(value);
                // We use +4 in the month cause when we set the date to 0, it fetches the previous month
                lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth() + 4);
                lastDayOfLastMonth.setDate(0);
                lastDayOfLastMonth.setHours(23, 59, 59, 59);

                // Check if the date falls within the trimester
                const dates = [issueDate, billingDate, paymentDate].map((date) => {
                    if (!date) return false;
                    const dateValue = new Date(date);
                    return dateValue > firstDayOfFirstMonth && dateValue < lastDayOfLastMonth;
                });
                // Return true if at least one date matches the filter
                return dates.some((val) => val);
            }),
            month: (data, value) => data.filter(({ issueDate, billingDate, paymentDate }) => {
                const month = value.getMonth();
                const year = value.getFullYear();

                // Check if the date falls within the selected month
                const dates = [issueDate, billingDate, paymentDate].map((date) => {
                    if (!date) return false;
                    const dateValue = new Date(date);
                    return dateValue.getMonth() === month && dateValue.getFullYear() === year;
                });
                // Return true if at least one date matches the filter
                return dates.some((val) => val);
            }),
        };

        // Return null if filterBy is not provided
        if (!filterBy) return null;

        // Apply the selected filter and return the filtered data
        const data = filters[filterBy](this.invoices, filterValue);
        return data;
    }


    /**
     * Handle query parameters for initial setup.
     */
    handleQueryParams({ filterOptions, input, select, paragraph }) {
        const queryParams = this.utils.fetchQueryParams();
        const filterBy = queryParams.get(this.QUERY_PARAMS_FILTER_BY_KEY);
        const queryParamsFilterByValue = queryParams.get(this.QUERY_PARAMS_FILTER_VALUE_KEY)
        const filterValue = new Date(new Date(queryParamsFilterByValue).setDate(new Date(queryParamsFilterByValue).getDate() + 1));

        if (!filterBy || !filterValue) return false;

        this.filterBy = filterBy;
        this.filterValue = filterValue;

        filterOptions.value = filterBy;

        const response = this.selectCallback({ option: filterBy, value: filterValue, input, select, paragraph });
        this.filterAndInjectData(response);

        return true;
    }

    /**
    * Filter data and inject it into the HTML elements.
    */
    filterAndInjectData({ filterBy, filterValue }) {
        const data = this.filterCallback({ filterBy, filterValue });
        this.utils.setQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY, filterBy)
        this.utils.setQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY, this.utils.formatDate({ date: filterValue, options: { year: "numeric", month: "numeric" } }).split("/").reverse().join("-"))
        this.injectData({ data: data || this.invoices });
    }

    /**
     * Generates chart data based on the provided invoices, filter criteria, and date range.
     */
    metricsChartInfo({ invoices }) {
        const filterBy = this.filterBy
        const filterValue = this.filterValue
        const utils = this.utils

        const filters = {
            "year": () => {
                const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                const delinquencyDataset = { label: "Delinquency amount", data: [] }
                const paidDataset = { label: "Paid Invoices", data: [] }

                invoices.forEach(({ status, paymentDate, value }) => {
                    const date = new Date(paymentDate)
                    const year = date.getFullYear()
                    const month = date.getMonth()

                    if (year !== filterValue.getFullYear()) return

                    if (status == "Payment overdue") {
                        if (!delinquencyDataset["data"][month]) delinquencyDataset["data"][month] = value
                        else delinquencyDataset["data"][month] += value
                    }

                    if (status == "Payment made") {
                        if (!paidDataset["data"][month]) paidDataset["data"][month] = value
                        else paidDataset["data"][month] += value
                    }

                })

                const datasets = [paidDataset, delinquencyDataset]
                return { labels, datasets }
            },
            "trimester": () => {
                const firstDayOfFirstMonth = new Date(filterValue);
                firstDayOfFirstMonth.setDate(1);
                firstDayOfFirstMonth.setHours(6, 0, 0, 0);

                // Calculate the last day of the trimester
                const lastDayOfLastMonth = new Date(filterValue);
                lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth() + 4);
                lastDayOfLastMonth.setDate(0);
                lastDayOfLastMonth.setHours(23, 59, 59, 59);

                const labels = []
                const currentDate = new Date(firstDayOfFirstMonth)
                while (currentDate <= lastDayOfLastMonth) {
                    labels.push(`${utils.formatDate({ date: currentDate, locale: 'en-US', options: { month: 'short', day: '2-digit' } })}`)
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                const delinquencyDataset = { label: "Delinquency amount", data: [] }
                const paidDataset = { label: "Paid Invoices", data: [] }

                invoices.forEach(({ status, paymentDate, value }) => {
                    const dateValue = new Date(paymentDate)
                    const date = utils.formatDate({ date: dateValue, locale: 'en-US', options: { month: 'short', day: '2-digit' } })
                    const indexOfDate = labels.indexOf(date)

                    if (indexOfDate === -1) return

                    if (status == "Payment overdue") {
                        if (!delinquencyDataset["data"][indexOfDate]) delinquencyDataset["data"][indexOfDate] = value
                        else delinquencyDataset["data"][indexOfDate] += value
                    }

                    if (status == "Payment made") {
                        if (!paidDataset["data"][indexOfDate]) paidDataset["data"][indexOfDate] = value
                        else paidDataset["data"][indexOfDate] += value
                    }

                })

                const datasets = [paidDataset, delinquencyDataset]
                return { labels, datasets }
            },
            "month": () => {
                const daysInMonth = new Date(filterValue.getFullYear(), filterValue.getMonth() + 1, 0).getDate()
                const labels = Array.from(Array(daysInMonth).keys()).map(val => val + 1)
                const delinquencyDataset = { label: "Delinquency amount", data: [] }
                const paidDataset = { label: "Paid Invoices", data: [] }

                invoices.forEach(({ status, paymentDate, value }) => {
                    const date = new Date(paymentDate)
                    const year = date.getFullYear()
                    const day = date.getDate()

                    if (year !== filterValue.getFullYear()) return

                    if (status == "Payment overdue") {
                        if (!delinquencyDataset["data"][day]) delinquencyDataset["data"][day] = value
                        else delinquencyDataset["data"][day] += value
                    }

                    if (status == "Payment made") {
                        if (!paidDataset["data"][day]) paidDataset["data"][day] = value
                        else paidDataset["data"][day] += value
                    }

                })

                const datasets = [paidDataset, delinquencyDataset]
                return { labels, datasets }
            }
        }

        if (!filterBy) {
            this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_BY_KEY);
            this.utils.deleteQueryParams(this.QUERY_PARAMS_FILTER_VALUE_KEY);

            // Default value
            const sortedInvoices = invoices.sort((invoiceA, invoiceB) => Number(new Date(invoiceA.issueDate)) - Number(new Date(invoiceB.issueDate)));
            const firstDate = new Date(sortedInvoices[0].issueDate)
            const lastDate = new Date(sortedInvoices[sortedInvoices.length - 1].issueDate)

            const labels = []
            const currentDate = new Date(firstDate)
            while (currentDate <= lastDate) {
                labels.push(`${utils.formatDate({ date: currentDate, locale: 'en-US', options: { month: 'short', day: '2-digit', year: "numeric" } })}`)
                currentDate.setDate(currentDate.getDate() + 1);
            }

            const delinquencyDataset = { label: "Delinquency amount", data: [] }
            const paidDataset = { label: "Paid Invoices", data: [] }

            sortedInvoices.forEach(({ status, issueDate, value }) => {
                const dateValue = new Date(issueDate)
                const date = utils.formatDate({ date: dateValue, locale: 'en-US', options: { month: 'short', day: '2-digit', year: "numeric" } })
                const indexOfDate = labels.indexOf(date)

                if (indexOfDate === -1) return

                if (status == "Payment overdue") {
                    if (!delinquencyDataset["data"][indexOfDate]) delinquencyDataset["data"][indexOfDate] = value
                    else delinquencyDataset["data"][indexOfDate] += value
                }

                if (status == "Payment made") {
                    if (!paidDataset["data"][indexOfDate]) paidDataset["data"][indexOfDate] = value
                    else paidDataset["data"][indexOfDate] += value
                }

            })

            const datasets = [paidDataset, delinquencyDataset]

            return { labels, datasets }
        };

        // Apply the selected filter and return the filtered data
        return filters[filterBy]();
    }

    /**
     * Injects data into the Metrics class.
     */
    injectData({ data }) {
        const cardsData = this.metricsCardsInfo({ invoices: data });
        const chartData = this.metricsChartInfo({ invoices: data })
        this.metrics.injectData({ cardsData, chartData });
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

        const hasQueryParams = this.handleQueryParams({ filterOptions, input, select, paragraph: trimesterParagraph });
        if (!hasQueryParams) this.injectData({ data: this.invoices });
    }
}
