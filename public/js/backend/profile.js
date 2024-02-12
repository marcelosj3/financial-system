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

    // Default profile data
    profileData = {}

    constructor({ name = "Name", role = "Role", image = { src: "", alt: "..." } } = {}) {
        // Set default profile data
        const profileData = { name, role, image }
        this.profileData = profileData;
    }

    /**
     * Fetches profile information from a JSON file or local storage.
     */
    async fetchProfileInfo() {
        try {
            // Try fetching from local storage, fallback to JSON file if not available
            const profileData = this.fetchFromLocalStorage() || await this.fetchFromJSON()
            this.profileData = profileData;
        } catch (error) {
            console.error("Couldn't fetch the profile data properly", error);
        }
    }

    /**
     * Fetches profile data from local storage.
     */
    fetchFromLocalStorage() {
        const profileData = JSON.parse(localStorage.getItem(this.PROFILE_LOCAL_STORAGE_KEY));
        return profileData;
    }

    /**
     * Fetches profile data from the JSON file.
     */
    async fetchFromJSON() {
        const response = await fetch(this.PROFILE_JSON_PATH);

        if (!response.ok) {
            throw new Error("Failed to fetch profile data.");
        }

        const json = await response.json();

        // Store fetched data in local storage for future use
        localStorage.setItem(this.PROFILE_LOCAL_STORAGE_KEY, JSON.stringify(json));

        return json;
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
