import { Profile } from "./profile.js";

/**
 * Backend class for handling data retrieval and injection.
 * Manages information and data injection into HTML elements.
 */
export class Backend {
    profile = {}

    constructor({ profile } = {}) {
        this.profile = profile || new Profile()
    }

    async injectData() {
        await this.profile.injectData()
    }
}
