import { Utils } from "../utils.js";

/**
 * Represents a Table with utility functions for data manipulation.
 */
export class Table {
    TABLE_CONTAINER_SELECTOR = "";
    TABLE_HEADERS_SELECTOR = "table thead tr th";
    TABLE_BODY_SELECTOR = "table tbody";

    utils = {};

    /**
     * Initializes a new instance of the Table class.
     */
    constructor({ containerSelector, utils } = {}) {
        this.TABLE_CONTAINER_SELECTOR = containerSelector;
        this.utils = utils || new Utils();
    }

    /**
     * Retrieves headers and converts them to keys for data injection.
     */
    getHeadersToKeys() {
        const selector = `${this.TABLE_CONTAINER_SELECTOR} ${this.TABLE_HEADERS_SELECTOR}`;
        const headers = document.querySelectorAll(selector);
        return Array.from(headers).map(header => this.utils.formatStringToKey(header.textContent));
    }

    /**
     * Injects a cell into the table row with the corresponding data.
     */
    injectCell(row, data, header, callback = (row, data, header, utils) => { }) {
        let value = "";
        const cell = document.createElement("td");
        cell.classList.add("text-nowrap");

        if (callback) value = callback({ row, data, header, utils: this.utils });

        cell.textContent = value;
        row.appendChild(cell);
    }

    /**
     * Injects table elements into the HTML based on the provided data.
     */
    injectData({ dataList = [], cellCallback = (row, data, header, utils) => { } }) {
        const selector = `${this.TABLE_CONTAINER_SELECTOR} ${this.TABLE_BODY_SELECTOR}`;
        const tableBody = document.querySelector(selector);
        const headersKeys = this.getHeadersToKeys();
        tableBody.innerHTML = ""

        dataList.forEach(data => {
            const row = document.createElement("tr");
            headersKeys.forEach(header => this.injectCell(row, data, header, cellCallback));
            tableBody.appendChild(row);
        });
    }
}
