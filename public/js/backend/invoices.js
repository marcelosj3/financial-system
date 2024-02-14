import { Utils } from "../utils.js";
import { InvoicesMetrics } from "./invoices/invoices-metrics.js";
import { InvoicesTable } from "./invoices/invoices-table.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class Invoices {
    INVOICES_JSON_PATH = "../../data/invoices.json";
    INVOICES_LOCAL_STORAGE_KEY = "invoicesData";
    METRICS_CONTAINER_SELECTOR = "section.metrics";
    METRICS_CARDS_CONTAINER_SELECTOR = ".cards";

    utils = {};
    invoicesTable = {};
    invoicesMetrics = {};

    invoices = [];

    /**
     * Initializes the Invoices class with the specified options.
     */
    constructor({ invoices, invoicesTable, invoicesMetrics, utils } = {}) {
        this.invoices = invoices;
        this.invoicesTable = invoicesTable || new InvoicesTable();
        this.invoicesMetrics = invoicesMetrics || new InvoicesMetrics();

        this.utils = utils || new Utils();
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

    injectTableData() {
        this.invoicesTable.invoices = this.invoices
        this.invoicesTable.injectInvoiceList()
    }

    injectMetricsData() {
        this.invoicesMetrics.invoices = this.invoices
        this.invoicesMetrics.injectMetrics()
    }

    /**
     * Fetches and injects all data from the mocked backend.
     */
    async injectData() {
        await this.fetchInvoices();
        this.injectTableData()
        this.injectMetricsData()
    }
}
