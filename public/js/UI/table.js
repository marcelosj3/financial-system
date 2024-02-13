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

    createEmptyStateHTML(headersLength) {
        const row = document.createElement("tr")
        const cell = document.createElement("td")
        const section = document.createElement("section")

        const heading = document.createElement("h6")
        const paragraph = document.createElement("p")

        heading.textContent = "No results found for these filters! "
        paragraph.textContent = "Let's try something else."
        cell.setAttribute('colspan', headersLength)
        cell.classList.add("empty-state")

        section.appendChild(heading)
        section.appendChild(paragraph)
        cell.appendChild(section)
        row.appendChild(cell)
        return row
    }


    injectEmptyState(tableBody, headersLength) {
        const emptyState = this.createEmptyStateHTML(headersLength)
        tableBody.appendChild(emptyState)
    }


    /**
     * Injects table elements into the HTML based on the provided data.
     */
    injectData({ dataList = [], cellCallback = (row, data, header, utils) => { } }) {
        const selector = `${this.TABLE_CONTAINER_SELECTOR} ${this.TABLE_BODY_SELECTOR}`;
        const tableBody = document.querySelector(selector);
        const headersKeys = this.getHeadersToKeys();
        tableBody.innerHTML = ""

        if (!dataList.length) this.injectEmptyState(tableBody, headersKeys.length)

        dataList.forEach(data => {
            const row = document.createElement("tr");
            headersKeys.forEach(header => this.injectCell(row, data, header, cellCallback));
            tableBody.appendChild(row);
        });
    }
}
