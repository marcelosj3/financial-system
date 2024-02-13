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

    invoices = [];
    utils = {}
    table = {}

    constructor({ invoices, utils, table } = {}) {
        this.invoices = invoices;
        this.utils = utils || new Utils()
        this.table = table || new Table({ containerSelector: this.TABLE_CONTAINER_SELECTOR, utils })
    }

    /**
     * Fetches invoices information from a JSON file or local storage.
     */
    async fetchInvoices() {
        try {
            const dataParameters = { localStorageKey: this.INVOICES_LOCAL_STORAGE_KEY, path: this.INVOICES_JSON_PATH }
            this.invoices = await this.utils.fetchData(dataParameters)
        } catch (error) {
            console.error("Error fetching invoices data", error);
        }
    }

    tableCellCallback({ row, data, header, utils }) {
        const value = data[header]
        if (header.toLowerCase().includes("date")) return utils.formatDate(value)
        if (header.toLowerCase() === "value") return utils.formatCurrency(value)
        return value
    }

    /**
     * Fetches and injects all data from the mocked backend.
     */
    async injectData() {
        await this.fetchInvoices();
        this.table.injectData({ dataList: this.invoices, cellCallback: this.tableCellCallback });
    }
}
