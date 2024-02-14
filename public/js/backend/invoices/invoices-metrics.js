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
    QUERY_PARAMS_FILTER_BY_KEY = "filter_metrics_by";
    QUERY_PARAMS_FILTER_VALUE_KEY = "filter_metrics_value";

    utils = {};
    inputTable = {};

    filterBy = null;
    filterValue = null;
    invoices = [];

    /**
     * Initializes the InvoicesMetrics class with the specified options.
     */
    constructor({ invoices, utils, metrics } = {}) {
        this.invoices = invoices;
        this.metrics = metrics || new Metrics({ containerSelector: this.METRICS_CONTAINER_SELECTOR, cardsContainerSelector: this.METRICS_CARDS_CONTAINER_SELECTOR });

        this.utils = utils || new Utils();
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
     * Injects metrics data into the UI using the Metrics class.
     */
    injectMetrics() {
        const data = this.metricsCardsInfo({ invoices: this.invoices });
        this.metrics.injectData({ data });
    }
}
