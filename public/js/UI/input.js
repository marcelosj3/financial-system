import { Utils } from "../utils.js";

/**
 * Input class for handling filter inputs.
 */
export class Input {
    CONTAINER_SELECTOR = "";
    INPUT_FILTER_SELECTOR = "";
    INPUT_FILTER_OPTIONS_SELECTOR = "";
    INPUT_FILTER_INPUT_SELECTOR = "";
    INPUT_FILTER_SELECT_SELECTOR = "";
    INPUT_FILTER_DATA = [];

    utils = {};

    /**
     * Initializes the Input class with the specified options.
     */
    constructor({ containerSelector, filterSelector, filterOptionsSelector, inputSelector, selectSelector, data, utils }) {
        this.CONTAINER_SELECTOR = containerSelector;
        this.INPUT_FILTER_SELECTOR = filterSelector;
        this.INPUT_FILTER_OPTIONS_SELECTOR = filterOptionsSelector;
        this.INPUT_FILTER_INPUT_SELECTOR = inputSelector;
        this.INPUT_FILTER_SELECT_SELECTOR = selectSelector;
        this.INPUT_FILTER_DATA = data;

        this.utils = utils || new Utils();
    }

    /**
     * Initializes filter inputs and options.
     */
    initializeFilterInputs({ selectOptions }) {
        const filter = document.querySelector(`${this.CONTAINER_SELECTOR} ${this.INPUT_FILTER_SELECTOR}`);
        const filterOptions = filter.querySelector(this.INPUT_FILTER_OPTIONS_SELECTOR);
        const input = filter.querySelector(this.INPUT_FILTER_INPUT_SELECTOR);
        const select = filter.querySelector(this.INPUT_FILTER_SELECT_SELECTOR);

        if (!!selectOptions) {
            selectOptions.forEach(status => {
                const option = document.createElement("option");
                option.value = this.utils.formatStringToKey(status);
                option.innerText = status;
                select.appendChild(option);
            });
        }

        return { filterOptions, input, select };
    }
}
