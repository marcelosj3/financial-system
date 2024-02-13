import { Utils } from "../utils.js";

/**
 * Backend class for handling data retrieval and injection.
 * Manages information and data injection into HTML elements.
 */
export class Profile {
    PROFILE_JSON_PATH = "../../data/profile.json";
    PROFILE_LOCAL_STORAGE_KEY = "profileData";
    PROFILE_SELECTORS = {
        name: ".profile-name",
        role: ".profile-role",
        image: ".profile-image"
    }

    profileData = {}
    utils = {}

    constructor({ name = "Name", role = "Role", image = { src: "", alt: "..." }, utils } = {}) {
        // Set default profile data
        const profileData = { name, role, image }
        this.profileData = profileData;
        this.utils = utils || new Utils()

    }

    /**
     * Fetches profile information from a JSON file or local storage.
     */
    async fetchProfileInfo() {
        try {
            const profileData = await this.utils.fetchData({ localStorageKey: this.PROFILE_LOCAL_STORAGE_KEY, path: this.PROFILE_JSON_PATH })
            this.profileData = profileData;
        } catch (error) {
            console.error("Couldn't fetch the profile data properly", error);
        }
    }

    /**
     * Fetches element placeholders and injects data from the fetched JSON file.
     */
    async injectProfileInfo() {
        // Ensure profile information is fetched
        await this.fetchProfileInfo();

        // Destructure profile data
        const { name, role, image } = this.profileData;

        // Select HTML elements by class
        const [nameElement, roleElement, imageElement] = Object
            .values(this.PROFILE_SELECTORS)
            .map(selector => document.querySelector(selector));

        // Inject data into HTML elements
        nameElement.textContent = name;
        roleElement.textContent = role;
        imageElement.src = image.src;
        imageElement.alt = image.alt;
    }

    /**
     * Injects all data from the mocked backend.
     */
    async injectData() {
        await this.injectProfileInfo();
    }
}
