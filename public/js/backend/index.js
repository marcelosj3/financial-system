import { Invoices } from "./invoices.js";
import { Profile } from "./profile.js";

/**
 * Backend class for handling data retrieval and injection.
 * Manages information and data injection into HTML elements.
 */
export class Backend {
    profile = {}
    invoices = {}

    constructor({ profile, invoices } = {}) {
        this.profile = profile || new Profile()
        this.invoices = invoices || new Invoices()
    }

    async injectData() {
        Promise.all([this.profile.injectData(), this.invoices.injectData()])
    }
}
