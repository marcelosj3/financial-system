import { Utils } from "../utils.js";

/**
 * Backend class responsible for handling data retrieval and injection.
 * Manages the retrieval of information and injection of data into HTML elements.
 */
export class Invoices {
    INVOICES_JSON_PATH = "../../data/invoices.json";
    TABLE_HEADERS_SELECTOR = "table thead tr th";
    TABLE_BODY_SELECTOR = "table tbody";
    INVOICES_LOCAL_STORAGE_KEY = "invoicesData";

    invoices = [];
    utils = {}

    constructor({ invoices, utils } = {}) {
        this.invoices = invoices;
        this.utils = utils || new Utils()
    }

    /**
     * Fetches invoices information from a JSON file or local storage.
     */
    async fetchInvoices() {
        try {
            const invoices = await this.utils.fetchData({ localStorageKey: this.INVOICES_LOCAL_STORAGE_KEY, path: this.INVOICES_JSON_PATH })
            this.invoices = invoices;
        } catch (error) {
            console.error("Error fetching invoices data", error);
        }
    }

    /**
     * Injects table elements into the HTML based on the invoices data.
     */
    injectTable() {
        const tableContainer = document.querySelector(this.TABLE_BODY_SELECTOR);
        const headersKeys = this.getHeadersToKeys();

        this.invoices.forEach(invoice => {
            const row = document.createElement("tr");
            headersKeys.forEach(header => this.injectCell(row, invoice, header));
            tableContainer.appendChild(row);
        })
    }

    /**
     * Retrieves headers and converts them to keys for data injection.
     */
    getHeadersToKeys() {
        const headers = document.querySelectorAll(this.TABLE_HEADERS_SELECTOR);
        return Array.from(headers).map(header => {
            const text = header.textContent;

            // Lowercases the first character of the string, removes spaces and apostrophes
            return text.slice(0, 1).toLowerCase() + text.slice(1).replaceAll(" ", "").replaceAll("'", "");
        });
    }


    /**
     * Injects a cell into the table row with the corresponding invoice data.
     */
    injectCell(row, invoice, header) {
        const cell = document.createElement("td");
        let text = invoice[header]
        cell.classList.add("text-nowrap");

        if (header.toLowerCase().includes("date")) text = this.utils.formatDate(text)
        if (header.toLowerCase() === "value") text = this.utils.formatCurrency(text)

        cell.textContent = text;
        row.appendChild(cell);
    }

    /**
     * Fetches and injects all data from the mocked backend.
     */
    async injectData() {
        await this.fetchInvoices();
        this.injectTable();
    }
}
